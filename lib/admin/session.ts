import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { storage } from "@/lib/admin/storage";

/**
 * Acceso al panel.
 *
 * Una sola cuenta de administración, protegida por contraseña. Nada secreto
 * vive en el código ni en el repositorio: el servidor lee dos variables de
 * entorno que se configuran en Netlify con `npm run admin:clave`.
 *
 *   ADMIN_PASSWORD_HASH   — hash scrypt de la contraseña (nunca la contraseña)
 *   ADMIN_SESSION_SECRET  — clave con la que se firman las sesiones
 *
 * Si falta cualquiera de las dos, el panel queda cerrado: no hay contraseña
 * por defecto ni modo de rescate.
 */

const SESSION_HOURS = 8;
const isProd = process.env.NODE_ENV === "production";

/** `__Host-` obliga a HTTPS, ruta raíz y sin dominio: no se puede fijar desde un subdominio. */
export const SESSION_COOKIE = isProd ? "__Host-tri-admin" : "tri-admin";

interface PasswordHash {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
}

/** Formato: `scrypt:N:r:p:sal:clave`, en base64url. Sin `$`, que Next expandiría en `.env`. */
function parseHash(raw: string): PasswordHash | null {
  const parts = raw.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  const salt = Buffer.from(parts[4], "base64url");
  const key = Buffer.from(parts[5], "base64url");
  const sane =
    Number.isInteger(N) && N >= 2 ** 14 && N <= 2 ** 20 && (N & (N - 1)) === 0 &&
    Number.isInteger(r) && r >= 8 && r <= 16 &&
    Number.isInteger(p) && p >= 1 && p <= 4 &&
    salt.length >= 16 && key.length >= 32;
  return sane ? { N, r, p, salt, key } : null;
}

interface AdminConfig {
  hash: PasswordHash;
  secret: Buffer;
  /** Huella del hash: cambiar la contraseña invalida las sesiones abiertas. */
  fingerprint: string;
}

function config(): AdminConfig | null {
  const rawHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const rawSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!rawHash || !rawSecret || rawSecret.length < 32) return null;
  const hash = parseHash(rawHash);
  if (!hash) return null;
  return {
    hash,
    secret: Buffer.from(rawSecret, "utf8"),
    fingerprint: createHash("sha256").update(rawHash).digest("base64url").slice(0, 16),
  };
}

export function isConfigured(): boolean {
  return config() !== null;
}

function derive(password: string, hash: PasswordHash): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFC"),
      hash.salt,
      hash.key.length,
      { N: hash.N, r: hash.r, p: hash.p, maxmem: 256 * hash.N * hash.r },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function verifyPassword(password: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const candidate = await derive(password, cfg.hash);
  return timingSafeEqual(candidate, cfg.hash.key);
}

/* -------------------------------- Sesión -------------------------------- */

function sign(cfg: AdminConfig, payload: string): string {
  return createHmac("sha256", cfg.secret)
    .update(`${payload}.${cfg.fingerprint}`)
    .digest("base64url");
}

/** Token: `vencimiento.azar.firma`. No guarda nada en el servidor. */
function issueToken(cfg: AdminConfig): string {
  const expires = Date.now() + SESSION_HOURS * 3_600_000;
  const payload = `${expires}.${randomBytes(12).toString("base64url")}`;
  return `${payload}.${sign(cfg, payload)}`;
}

function validToken(cfg: AdminConfig, token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const expires = Number(parts[0]);
  const now = Date.now();
  if (!Number.isFinite(expires) || expires <= now || expires > now + SESSION_HOURS * 3_600_000) {
    return false;
  }
  const expected = Buffer.from(sign(cfg, `${parts[0]}.${parts[1]}`));
  const received = Buffer.from(parts[2]);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function createSession(): Promise<void> {
  const cfg = config();
  if (!cfg) throw new Error("El panel no está configurado.");
  (await cookies()).set(SESSION_COOKIE, issueToken(cfg), {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  return validToken(cfg, (await cookies()).get(SESSION_COOKIE)?.value);
}

/** Para las páginas del panel: sin sesión válida, al formulario de acceso. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/* --------------------------- Intentos fallidos -------------------------- */

/**
 * Límite de intentos por IP, guardado en el almacén y no en memoria: en
 * Netlify cada instancia tiene su propia memoria, y un contador local se
 * reinicia en cuanto el atacante cae en otra.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;
const LOCK_MS = 15 * 60_000;

interface Attempts {
  failures: number;
  since: number;
  lockedUntil: number;
}

/** La IP no se guarda: solo una huella firmada con el secreto. */
function attemptsKey(cfg: AdminConfig, ip: string): string {
  const id = createHmac("sha256", cfg.secret).update(`intentos:${ip}`).digest("hex").slice(0, 32);
  return `seguridad/intentos/${id}`;
}

export async function loginAllowed(ip: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const cfg = config();
  if (!cfg) return { allowed: false, retryAfter: 0 };
  const { data } = await storage().getJSON<Attempts>(attemptsKey(cfg, ip));
  const now = Date.now();
  if (data && data.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((data.lockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export async function recordFailure(ip: string): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  const key = attemptsKey(cfg, ip);
  const store = storage();
  const now = Date.now();
  const { data } = await store.getJSON<Attempts>(key);
  const current =
    data && now - data.since < WINDOW_MS ? data : { failures: 0, since: now, lockedUntil: 0 };
  current.failures += 1;
  if (current.failures >= MAX_FAILURES) current.lockedUntil = now + LOCK_MS;
  await store.setJSON(key, current);
}

export async function clearFailures(ip: string): Promise<void> {
  const cfg = config();
  if (!cfg) return;
  await storage().delete(attemptsKey(cfg, ip));
}

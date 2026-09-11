import { NextResponse } from "next/server";
import { fail, readJson, sameOrigin } from "@/lib/admin/http";
import {
  clearFailures,
  createSession,
  destroySession,
  isConfigured,
  loginAllowed,
  recordFailure,
  verifyPassword,
} from "@/lib/admin/session";
import { clientIp } from "@/lib/utils/client-ip";

/** Inicio de sesión del panel. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail(403, "Origen no permitido.");
  if (!isConfigured()) return fail(503, "El panel de administración no está configurado.");

  const ip = clientIp(request);
  const gate = await loginAllowed(ip);
  if (!gate.allowed) {
    const minutes = Math.max(1, Math.ceil(gate.retryAfter / 60));
    return fail(429, `Demasiados intentos fallidos. Espera ${minutes} minuto(s).`, {
      "Retry-After": String(gate.retryAfter),
    });
  }

  const body = (await readJson(request, 2_000)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password || password.length > 200) return fail(400, "Escribe la contraseña.");

  if (!(await verifyPassword(password))) {
    await recordFailure(ip);
    return fail(401, "Contraseña incorrecta.");
  }

  await clearFailures(ip);
  await createSession();
  return NextResponse.json({ ok: true });
}

/** Cierre de sesión. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return fail(403, "Origen no permitido.");
  await destroySession();
  return NextResponse.json({ ok: true });
}

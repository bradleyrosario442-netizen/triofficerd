import { NextResponse } from "next/server";
import { isAdmin, isConfigured } from "@/lib/admin/session";

export function fail(status: number, error: string, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

/**
 * La petición viene de una página de este mismo sitio.
 *
 * La cookie de sesión ya es `SameSite=Strict`; esto cierra además el caso de
 * navegadores que no la respetan. El navegador fija `Origin` y una página
 * ajena no puede cambiarlo.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Puerta de todos los endpoints del panel: configuración, origen y sesión. */
export async function guard(request: Request): Promise<NextResponse | null> {
  if (!isConfigured()) return fail(503, "El panel de administración no está configurado.");
  if (!sameOrigin(request)) return fail(403, "Origen no permitido.");
  if (!(await isAdmin())) return fail(401, "La sesión expiró. Vuelve a iniciar sesión.");
  return null;
}

/** JSON del cuerpo con tope de tamaño: nada de leer cuerpos arbitrarios. */
export async function readJson(request: Request, maxBytes = 32_000): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return null;
  const text = await request.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

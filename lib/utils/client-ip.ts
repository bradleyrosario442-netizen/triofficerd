/**
 * IP del cliente.
 *
 * En Netlify, `x-nf-client-connection-ip` la fija la propia CDN y el cliente
 * no puede falsearla. `x-forwarded-for` queda como respaldo para desarrollo.
 */
export function clientIp(request: Request): string {
  const forwarded =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for") ??
    "";
  return forwarded.split(",")[0].trim() || "desconocido";
}

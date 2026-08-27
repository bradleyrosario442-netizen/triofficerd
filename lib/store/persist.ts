/** Utilidades de persistencia local. Evitan que el carrito o la cotización
 *  se pierdan al recargar la página. */

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: la sesión sigue funcionando en memoria */
  }
}

export const STORAGE_KEYS = {
  cart: "trioffice.cart.v1",
  coupon: "trioffice.coupon.v1",
  quote: "trioffice.quote.v1",
} as const;

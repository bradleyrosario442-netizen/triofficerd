import { makeVariants } from "@/components/admin/image-variants";

/** Respuesta de la API del panel. */
export interface ApiData {
  error?: string;
  errors?: Record<string, string>;
  id?: string;
  fotos?: string[];
}

/** Llamada JSON a la API del panel. Una sesión vencida lleva al acceso. */
export async function api<T = ApiData>(
  url: string,
  method: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: T & ApiData }> {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as T & ApiData;
    if (response.status === 401) window.location.assign("/admin/login");
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Sin conexión con el servidor." } as T & ApiData };
  }
}

export interface UploadResult {
  ok: boolean;
  fotos?: string[];
  error?: string;
  unauthorized?: boolean;
}

/** Optimiza una foto en el navegador y la sube al producto. */
export async function uploadPhoto(
  productId: string,
  file: File,
  options: { replace?: boolean; defer?: boolean } = {},
): Promise<UploadResult> {
  let variants: { lg: Blob; sm: Blob };
  try {
    variants = await makeVariants(file);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo procesar la imagen." };
  }

  const extension = variants.lg.type === "image/webp" ? "webp" : "jpg";
  const form = new FormData();
  form.set("id", productId);
  form.set("lg", variants.lg, `foto.${extension}`);
  form.set("sm", variants.sm, `foto.${extension}`);
  if (options.replace) form.set("reemplazar", "1");
  if (options.defer) form.set("diferir", "1");

  try {
    const response = await fetch("/api/admin/fotos", { method: "POST", body: form });
    const data = (await response.json().catch(() => ({}))) as ApiData;
    if (response.status === 401) {
      return { ok: false, unauthorized: true, error: data.error ?? "La sesión expiró." };
    }
    if (!response.ok) return { ok: false, error: data.error ?? `Error ${response.status}.` };
    return { ok: true, fotos: data.fotos };
  } catch {
    return { ok: false, error: "Sin conexión con el servidor." };
  }
}

/** Publica en el sitio lo que se subió con `defer`. */
export async function publishChanges(): Promise<void> {
  await fetch("/api/admin/publicar", { method: "POST" }).catch(() => undefined);
}

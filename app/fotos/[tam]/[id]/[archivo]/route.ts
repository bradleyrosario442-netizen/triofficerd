import { CONTENT_TYPES, isPhotoFile, isProductId, photoKey, type PhotoFormat } from "@/lib/admin/photos";
import { storage } from "@/lib/admin/storage";

/**
 * Sirve las fotos subidas desde el panel.
 *
 * Cada archivo tiene un nombre único y nunca cambia de contenido, así que se
 * cachea un año en el navegador y en la CDN: la función solo corre la primera
 * vez que alguien pide cada foto.
 */
export const dynamic = "force-dynamic";

const notFound = () =>
  new Response("No encontrado", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tam: string; id: string; archivo: string }> },
) {
  const { tam, id, archivo } = await params;
  if ((tam !== "lg" && tam !== "sm") || !isProductId(id) || !isPhotoFile(archivo)) return notFound();

  const bytes = await storage().getBytes(photoKey(tam, id, archivo));
  if (!bytes) return notFound();

  const format = archivo.slice(archivo.lastIndexOf(".") + 1) as PhotoFormat;
  return new Response(bytes, {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Cache-Control": "public, max-age=31536000, immutable",
      "Netlify-CDN-Cache-Control": "public, max-age=31536000, immutable, durable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Fuente de imagen de un producto.
 *
 * Las fotos subidas desde el panel (`/fotos/lg/...`) ya llegan optimizadas y
 * con una versión pequeña (`/fotos/sm/...`): se usan tal cual. Las demás
 * —ilustraciones y fotos del repositorio— pasan por el optimizador de Next.
 */
const UPLOADED = "/fotos/lg/";

export function uploadedPhotoUrl(productId: string, file: string): string {
  return `${UPLOADED}${productId}/${file}`;
}

export function imageSource(
  src: string,
  size: "sm" | "lg" = "lg",
): { src: string; unoptimized?: boolean } {
  if (!src.startsWith(UPLOADED)) return { src };
  return {
    src: size === "sm" ? `/fotos/sm/${src.slice(UPLOADED.length)}` : src,
    unoptimized: true,
  };
}

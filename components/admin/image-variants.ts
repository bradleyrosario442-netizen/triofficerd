/**
 * Prepara una foto en el navegador antes de subirla: la endereza según su
 * orientación EXIF, la reduce y la convierte a WebP en dos tamaños.
 *
 * Se hace aquí y no en el servidor por dos razones: Netlify limita cada
 * petición a 6 MB —una foto de celular pasa de eso— y su optimizador de
 * imágenes no procesa archivos servidos por una función.
 */

const LARGE = 1600;
const SMALL = 480;
const MAX_INPUT = 40 * 1024 * 1024;

const EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

export function isImageFile(file: File): boolean {
  return EXTENSIONS.test(file.name);
}

function scaled(source: CanvasImageSource, width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("El navegador no pudo procesar la imagen.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** WebP si el navegador sabe codificarlo; si no, JPEG sobre fondo blanco. */
async function encode(canvas: HTMLCanvasElement): Promise<Blob> {
  const webp = await toBlob(canvas, "image/webp", 0.86);
  if (webp && webp.type === "image/webp") return webp;

  const flat = document.createElement("canvas");
  flat.width = canvas.width;
  flat.height = canvas.height;
  const context = flat.getContext("2d");
  if (!context) throw new Error("El navegador no pudo procesar la imagen.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, flat.width, flat.height);
  context.drawImage(canvas, 0, 0);
  const jpeg = await toBlob(flat, "image/jpeg", 0.88);
  if (!jpeg) throw new Error("No se pudo convertir la imagen.");
  return jpeg;
}

export async function makeVariants(file: File): Promise<{ lg: Blob; sm: Blob }> {
  if (file.size > MAX_INPUT) throw new Error("La imagen pesa más de 40 MB.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Formato no compatible. Usa JPG, PNG o WebP.");
  }

  try {
    const large = scaled(bitmap, bitmap.width, bitmap.height, LARGE);
    // La pequeña sale de la grande: reducir en dos pasos da mejor nitidez.
    const small = scaled(large, large.width, large.height, SMALL);
    return { lg: await encode(large), sm: await encode(small) };
  } finally {
    bitmap.close();
  }
}

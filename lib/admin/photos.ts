import { randomBytes } from "node:crypto";
import { storage } from "@/lib/admin/storage";

/**
 * Fotografías subidas desde el panel.
 *
 * El navegador las entrega ya redimensionadas en dos tamaños —grande para la
 * ficha, pequeña para tarjetas y miniaturas—, porque el optimizador de
 * imágenes de Netlify no procesa archivos servidos por una función. Cada foto
 * se guarda con un nombre nuevo, así que su URL nunca cambia de contenido y se
 * puede cachear para siempre.
 */

export const MAX_PHOTOS = 12;

export const MAX_BYTES = {
  lg: 4 * 1024 * 1024,
  sm: 800 * 1024,
} as const;

export type PhotoSize = keyof typeof MAX_BYTES;
export type PhotoFormat = "webp" | "jpg" | "png";

export const CONTENT_TYPES: Record<PhotoFormat, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
};

/** Ids del catálogo: minúsculas, números y guiones. Nada que altere una ruta. */
const PRODUCT_ID = /^[a-z0-9][a-z0-9-]*$/;
const FILE_NAME = /^[a-z0-9]{12,40}\.(webp|jpg|png)$/;

export const isProductId = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 90 && PRODUCT_ID.test(value);

export const isPhotoFile = (value: unknown): value is string =>
  typeof value === "string" && FILE_NAME.test(value);

/**
 * Formato real por los primeros bytes. La extensión y el tipo que declara el
 * navegador los decide el cliente; esto no.
 */
export function detectFormat(bytes: Uint8Array): PhotoFormat | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length > 8 && bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
  return null;
}

export function newPhotoFile(format: PhotoFormat): string {
  return `${Date.now().toString(36)}${randomBytes(6).toString("hex")}.${format}`;
}

export const photoKey = (size: PhotoSize, id: string, file: string) => `fotos/${size}/${id}/${file}`;

/** Borra los dos tamaños de cada foto. Un fallo aislado no detiene el resto. */
export async function deletePhotoFiles(id: string, files: string[]): Promise<void> {
  const store = storage();
  await Promise.allSettled(
    files.flatMap((file) => [
      store.delete(photoKey("lg", id, file)),
      store.delete(photoKey("sm", id, file)),
    ]),
  );
}

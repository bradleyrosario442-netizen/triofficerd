import { NextResponse } from "next/server";
import { fail, guard, readJson } from "@/lib/admin/http";
import { publish, updatePhotos } from "@/lib/admin/overlay";
import {
  deletePhotoFiles,
  detectFormat,
  isPhotoFile,
  isProductId,
  MAX_BYTES,
  MAX_PHOTOS,
  newPhotoFile,
  photoKey,
} from "@/lib/admin/photos";
import { storage } from "@/lib/admin/storage";
import { productExists } from "@/lib/services/catalog";

/** Aborta una modificación del índice sin escribir nada. */
class Rejected extends Error {}

/** Netlify corta los cuerpos de más de 6 MB; se rechaza antes de leerlos. */
const MAX_REQUEST = 6 * 1024 * 1024;

/**
 * Sube una foto —en sus dos tamaños— y la añade al producto.
 *
 * `reemplazar=1` descarta las que ya tenía, y `diferir=1` no publica: la
 * subida masiva publica una vez cada tanto en lugar de tras cada foto.
 */
export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  if (Number(request.headers.get("content-length") ?? 0) > MAX_REQUEST) {
    return fail(413, "La foto pesa demasiado.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Envío no válido.");
  }

  const id = form.get("id");
  const lg = form.get("lg");
  const sm = form.get("sm");
  const replace = form.get("reemplazar") === "1";
  const defer = form.get("diferir") === "1";

  if (!isProductId(id) || !(await productExists(id))) return fail(404, "El producto no existe.");
  if (!(lg instanceof File) || !(sm instanceof File)) return fail(400, "Faltan las imágenes.");
  if (lg.size > MAX_BYTES.lg || sm.size > MAX_BYTES.sm) {
    return fail(413, "La foto pesa demasiado incluso después de optimizarla.");
  }

  const [lgBytes, smBytes] = await Promise.all([lg.arrayBuffer(), sm.arrayBuffer()]);
  const format = detectFormat(new Uint8Array(lgBytes));
  if (!format || detectFormat(new Uint8Array(smBytes)) !== format) {
    return fail(415, "Formato no admitido. Usa JPG, PNG o WebP.");
  }

  const file = newPhotoFile(format);
  const store = storage();
  await Promise.all([
    store.setBytes(photoKey("lg", id, file), lgBytes),
    store.setBytes(photoKey("sm", id, file), smBytes),
  ]);

  let replaced: string[] = [];
  let list: string[] = [];
  try {
    await updatePhotos((photos) => {
      const current = photos.productos[id] ?? [];
      const next = replace ? [file] : [...current, file];
      if (next.length > MAX_PHOTOS) {
        throw new Rejected(`Cada producto admite hasta ${MAX_PHOTOS} fotos.`);
      }
      replaced = replace ? current : [];
      photos.productos[id] = next;
      list = next;
    });
  } catch (error) {
    // Sin registrar en el índice, los archivos no pertenecen a nada.
    await deletePhotoFiles(id, [file]);
    if (error instanceof Rejected) return fail(409, error.message);
    throw error;
  }

  await deletePhotoFiles(id, replaced);
  if (!defer) publish();
  return NextResponse.json({ ok: true, archivo: file, fotos: list });
}

/** Quita una foto del producto. */
export async function DELETE(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const body = (await readJson(request, 1_000)) as { id?: unknown; archivo?: unknown } | null;
  const id = body?.id;
  const archivo = body?.archivo;
  if (!isProductId(id) || !isPhotoFile(archivo)) return fail(400, "Datos no válidos.");

  let list: string[] = [];
  try {
    await updatePhotos((photos) => {
      const current = photos.productos[id] ?? [];
      if (!current.includes(archivo)) throw new Rejected("La foto ya no existe.");
      list = current.filter((entry) => entry !== archivo);
      if (list.length > 0) photos.productos[id] = list;
      else delete photos.productos[id];
    });
  } catch (error) {
    if (error instanceof Rejected) return fail(404, error.message);
    throw error;
  }

  await deletePhotoFiles(id, [archivo]);
  publish();
  return NextResponse.json({ ok: true, fotos: list });
}

/** Cambia el orden de las fotos. La primera es la portada del producto. */
export async function PUT(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const body = (await readJson(request, 4_000)) as { id?: unknown; orden?: unknown } | null;
  const id = body?.id;
  const order = body?.orden;
  if (
    !isProductId(id) ||
    !Array.isArray(order) ||
    !order.every(isPhotoFile) ||
    new Set(order).size !== order.length
  ) {
    return fail(400, "Datos no válidos.");
  }

  try {
    await updatePhotos((photos) => {
      const current = photos.productos[id] ?? [];
      const same = order.length === current.length && order.every((entry) => current.includes(entry));
      if (!same) throw new Rejected("Las fotos cambiaron mientras tanto. Recarga la página.");
      photos.productos[id] = order;
    });
  } catch (error) {
    if (error instanceof Rejected) return fail(409, error.message);
    throw error;
  }

  publish();
  return NextResponse.json({ ok: true, fotos: order });
}

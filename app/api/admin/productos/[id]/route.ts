import { NextResponse } from "next/server";
import { fail, guard, readJson } from "@/lib/admin/http";
import { publish, updateOverlay, updatePhotos, type ProductPatch } from "@/lib/admin/overlay";
import { deletePhotoFiles, isProductId } from "@/lib/admin/photos";
import { parseProductInput, type ProductInput } from "@/lib/admin/validation";
import { baseInput, isBaseProduct } from "@/lib/services/catalog";

type Context = { params: Promise<{ id: string }> };

/** Aborta una modificación sin escribir nada. */
class NotFound extends Error {}

async function ensure(change: () => Promise<unknown>): Promise<NextResponse | null> {
  try {
    await change();
    return null;
  } catch (error) {
    if (error instanceof NotFound) return fail(404, "El producto no existe.");
    throw error;
  }
}

/** Guarda los datos del producto. */
export async function PATCH(request: Request, { params }: Context) {
  const denied = await guard(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isProductId(id)) return fail(404, "El producto no existe.");

  const { value, errors } = parseProductInput(await readJson(request));
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Revisa los campos marcados.", errors }, { status: 422 });
  }

  const original = baseInput(id);
  const missing = await ensure(() =>
    updateOverlay((overlay) => {
      if (original) {
        // Solo se guarda lo que difiere del catálogo importado: volver al
        // valor original deshace el cambio en lugar de fijarlo.
        const patch: ProductPatch = {};
        for (const key of Object.keys(value) as (keyof ProductInput)[]) {
          if (value[key] !== original[key]) (patch as Record<string, unknown>)[key] = value[key];
        }
        if (Object.keys(patch).length > 0) overlay.edits[id] = patch;
        else delete overlay.edits[id];
      } else if (overlay.added[id]) {
        overlay.added[id] = { ...overlay.added[id], ...value };
      } else {
        throw new NotFound();
      }
    }),
  );
  if (missing) return missing;

  publish();
  return NextResponse.json({ ok: true });
}

/**
 * Elimina un producto. Los del catálogo importado se retiran del sitio y se
 * pueden restaurar; los creados en el panel se borran junto con sus fotos.
 */
export async function DELETE(request: Request, { params }: Context) {
  const denied = await guard(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isProductId(id)) return fail(404, "El producto no existe.");

  if (isBaseProduct(id)) {
    await updateOverlay((overlay) => {
      if (!overlay.hidden.includes(id)) overlay.hidden.push(id);
    });
    publish();
    return NextResponse.json({ ok: true, eliminado: "retirado" });
  }

  const missing = await ensure(() =>
    updateOverlay((overlay) => {
      if (!overlay.added[id]) throw new NotFound();
      delete overlay.added[id];
    }),
  );
  if (missing) return missing;

  let files: string[] = [];
  await updatePhotos((photos) => {
    files = photos.productos[id] ?? [];
    delete photos.productos[id];
  });
  await deletePhotoFiles(id, files);

  publish();
  return NextResponse.json({ ok: true, eliminado: "definitivo" });
}

/** Acciones sobre productos del catálogo importado: restaurar o revertir. */
export async function POST(request: Request, { params }: Context) {
  const denied = await guard(request);
  if (denied) return denied;
  const { id } = await params;
  if (!isBaseProduct(id)) return fail(404, "El producto no existe.");

  const body = (await readJson(request, 1_000)) as { accion?: unknown } | null;
  if (body?.accion === "restaurar") {
    await updateOverlay((overlay) => {
      overlay.hidden = overlay.hidden.filter((entry) => entry !== id);
    });
  } else if (body?.accion === "revertir") {
    await updateOverlay((overlay) => {
      delete overlay.edits[id];
    });
  } else {
    return fail(400, "Acción no válida.");
  }

  publish();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { guard, readJson } from "@/lib/admin/http";
import { publish, updateOverlay } from "@/lib/admin/overlay";
import { parseProductInput } from "@/lib/admin/validation";
import { slugify } from "@/lib/data/products";
import { isBaseProduct } from "@/lib/services/catalog";

/** Crea un producto nuevo. Su id es también su dirección en el sitio. */
export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const { value, errors } = parseProductInput(await readJson(request));
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Revisa los campos marcados.", errors }, { status: 422 });
  }

  const base =
    slugify(`${value.brandName} ${value.sku || value.name}`).replace(/-+$/, "") || "producto";
  let id = base;
  await updateOverlay((overlay) => {
    id = base;
    for (let n = 2; isBaseProduct(id) || overlay.added[id]; n += 1) id = `${base}-${n}`;
    overlay.added[id] = { ...value, id, createdAt: new Date().toISOString() };
  });

  publish();
  return NextResponse.json({ ok: true, id });
}

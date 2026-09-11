import { NextResponse } from "next/server";
import { guard, readJson } from "@/lib/admin/http";
import { getAdminCatalog, normalize, type AdminProduct } from "@/lib/services/catalog";

/**
 * Empareja nombres de archivo con productos, para la subida masiva.
 *
 * Mismo criterio que `npm run imagenes`: el nombre es el número de parte o el
 * id del producto, sin importar mayúsculas, guiones ni guiones bajos. Para
 * varias fotos se añade `-1`, `-2`… (o el `(2)` que pone Windows al duplicar).
 * Primero se prueba el nombre completo, así un número de parte que ya termina
 * en `-2` no se confunde con el orden.
 */

const key = (value: string) => normalize(value).replace(/[^a-z0-9]/g, "");

const SUFFIXES = [/^(.*?)[-_ ](\d{1,2})$/, /^(.*?)\s*\((\d{1,2})\)$/];

export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const body = (await readJson(request, 200_000)) as { nombres?: unknown } | null;
  const names = (Array.isArray(body?.nombres) ? body.nombres : [])
    .filter((name): name is string => typeof name === "string" && name.length <= 200)
    .slice(0, 1000);

  const { items } = await getAdminCatalog();
  const visible = items.filter((item) => !item.hidden);
  const index = new Map<string, AdminProduct>();
  // Los ids primero: un número de parte no debe tapar el id de otro producto.
  for (const item of visible) index.set(key(item.product.id), item);
  for (const item of visible) {
    const sku = item.input.sku ? key(item.input.sku) : "";
    if (sku && !index.has(sku)) index.set(sku, item);
  }

  const resultados = names.map((nombre) => {
    const base = nombre.replace(/\.[a-z0-9]{2,5}$/i, "").trim();
    let match = index.get(key(base));
    let orden = 0;
    for (const pattern of SUFFIXES) {
      if (match) break;
      const found = base.match(pattern);
      if (found) {
        match = index.get(key(found[1]));
        orden = Number(found[2]);
      }
    }
    return match
      ? {
          nombre,
          id: match.product.id,
          orden,
          producto: match.product.name,
          fotos: match.photos.length,
        }
      : { nombre, id: null, orden: 0 };
  });

  return NextResponse.json({ resultados });
}

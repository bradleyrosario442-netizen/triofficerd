import rawCatalog from "@/data/products.json";
import { sourceMap } from "@/lib/data/taxonomy";
import type { Product } from "@/lib/types";
import { displayName, titleCase } from "@/lib/utils/product-name";

/**
 * Catálogo de Tri Office.
 *
 * La fuente es `data/products.json`, que produce `scripts/import-catalog.mjs`
 * y solo contiene datos de hecho: marca, nombre del producto, número de parte
 * del fabricante y categoría de origen.
 *
 * Todo el catálogo es de cotización: no hay precio publicado, y por eso
 * `price` es `null` y `quoteOnly` es `true` en cada entrada. Ese es el
 * contrato con la interfaz, que ya sabe ocultar precio y botón de compra.
 */

interface RawProduct {
  brand: string;
  name: string;
  model: string;
  sourceCategory: string;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Ilustración por tipo de producto, tres variantes por subcategoría. */
function imagesFor(icon: string, seed: number): string[] {
  return [`/img/products/${icon}-${(seed % 3) + 1}.svg`];
}

/**
 * Marcas conocidas del propio catálogo, para las entradas que llegan sin el
 * campo de marca. Si el nombre menciona una marca que ya existe en el catálogo,
 * se le asigna esa; si no, queda como genérica.
 */
function knownBrands(rows: RawProduct[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    const brand = row.brand.trim();
    if (brand.length >= 3) set.add(brand);
  }
  // Primero las más largas: "Klip Xtreme" antes que "Klip".
  return [...set].sort((a, b) => b.length - a.length);
}

function buildProducts(): Product[] {
  const list: Product[] = [];
  const usedSlugs = new Set<string>();
  const rows = rawCatalog as RawProduct[];
  const known = knownBrands(rows);

  rows.forEach((raw, index) => {
    const entry = sourceMap[raw.sourceCategory];
    if (!entry) return; // categoría fuera del alcance de Tri Office

    const upperName = raw.name.toUpperCase();
    const brandName =
      raw.brand.trim() ||
      known.find((candidate) => upperName.includes(candidate.toUpperCase())) ||
      "Genérico";
    const name = displayName(raw.name, 90);
    const model = raw.model.trim();

    // El slug prioriza marca + modelo, que es lo que identifica al producto.
    const base = slugify(`${brandName} ${model || raw.name}`) || `producto-${index}`;
    let slug = base;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);

    list.push({
      id: slug,
      slug,
      sku: model || "—",
      name,
      shortDescription: "",
      description: "",
      category: entry.category,
      subcategory: entry.subcategory,
      brand: slugify(brandName),
      price: null,
      previousPrice: null,
      stock: 0,
      availability: "on_request",
      images: imagesFor(entry.icon, index),
      specifications: [
        { label: "Marca", value: titleCase(brandName) },
        ...(model ? [{ label: "Número de parte", value: model }] : []),
        { label: "Categoría", value: entry.subcategoryName },
      ],
      features: [],
      kind: "corporate",
      featured: false,
      bestseller: false,
      isNew: false,
      sale: false,
      quoteOnly: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  return list;
}

export const products: Product[] = buildProducts();

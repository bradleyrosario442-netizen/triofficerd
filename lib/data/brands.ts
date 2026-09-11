import type { Brand, Product } from "@/lib/types";
import { titleCase } from "@/lib/utils/product-name";

/**
 * Marcas del catálogo, derivadas de los productos publicados.
 *
 * No se declara ninguna marca que no tenga producto, y `logo` queda en `null`
 * hasta que se cargue el archivo correspondiente: mientras tanto se muestra el
 * nombre en texto. No se publica ningún logotipo ajeno sin tenerlo cargado.
 */

/** Nombres con grafía propia que el título automático no acierta. */
const EXACT: Record<string, string> = {
  generico: "Genérico",
  hp: "HP",
  "hp-refurbish": "HP Refurbish",
  msi: "MSI",
  aoc: "AOC",
  jbl: "JBL",
  tp_link: "TP-Link",
  "tp-link": "TP-Link",
  hikvision: "HIKVISION",
  hiksemi: "HIKSEMI",
  chargeworx: "CHARGEWORX",
  myo: "MYO",
  apc: "APC",
  ups: "UPS",
  lg: "LG",
  asus: "ASUS",
  acer: "Acer",
  "klip-xtreme": "Klip Xtreme",
  xtech: "Xtech",
  "nexxt-infrastructure": "Nexxt Infrastructure",
};

/**
 * Nombre visible de una marca. `typed` es el nombre tal como se escribió en
 * el panel, para marcas nuevas: se respeta su grafía salvo que haya una fija.
 */
export function brandLabel(slug: string, typed?: string): string {
  return EXACT[slug] ?? (typed?.trim() || titleCase(slug.replace(/-/g, " ")));
}

export function buildBrands(products: Product[], label: (slug: string) => string): Brand[] {
  const counts = new Map<string, { name: string; count: number; cats: Set<string> }>();

  for (const product of products) {
    const entry = counts.get(product.brand) ?? {
      name: label(product.brand),
      count: 0,
      cats: new Set<string>(),
    };
    entry.count += 1;
    entry.cats.add(product.category);
    counts.set(product.brand, entry);
  }

  return [...counts]
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name))
    .map(([slug, entry]) => ({
      slug,
      name: entry.name,
      logo: null,
      categories: [...entry.cats],
    }));
}

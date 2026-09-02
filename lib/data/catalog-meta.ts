import brandNames from "@/data/brand-names.json";
import { categories } from "@/lib/data/taxonomy";
import type { Subcategory } from "@/lib/types";

/**
 * Metadatos del catálogo seguros para el cliente.
 *
 * `lib/services/catalog.ts` importa los 2.862 productos, así que cualquier
 * componente de cliente que lo toque arrastra el catálogo entero al bundle.
 * Este módulo expone lo poco que necesitan —nombre de marca, subcategorías del
 * menú, sugerencias de búsqueda— sin cargar los productos.
 */

const names = brandNames as Record<string, string>;

/** Nombre legible de una marca a partir de su slug. */
export function brandName(slug: string): string {
  return names[slug] ?? slug;
}

/** Subcategorías de una categoría, para el mega menú y la navegación móvil. */
export function menuSubcategories(categorySlug: string, limit = 7): Subcategory[] {
  const category = categories.find((entry) => entry.slug === categorySlug);
  return category ? category.subcategories.slice(0, limit) : [];
}

/** Sugerencias del buscador. */
export const popularSearches = [
  "Laptop",
  "Tóner HP",
  "Monitor",
  "Switch",
  "Cámara de seguridad",
];

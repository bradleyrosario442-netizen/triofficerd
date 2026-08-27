import type { ProductAvailability, ProductFilters, ProductKind, SortKey } from "@/lib/types";

/**
 * Traducción entre la URL y el estado del catálogo.
 * Mantener los filtros en la URL hace que cada vista sea enlazable,
 * indexable y compartible.
 */

export type RawParams = Record<string, string | string[] | undefined>;

export interface ShopState {
  filters: ProductFilters;
  sort: SortKey;
  view: "grid" | "list";
  page: number;
  raw: {
    q: string;
    categoria: string;
    subcategoria: string;
    marcas: string[];
    min: string;
    max: string;
    disponibilidad: string[];
    tipo: string[];
    oferta: boolean;
  };
}

export const sortOptions: { value: SortKey; param: string; label: string }[] = [
  { value: "featured", param: "destacados", label: "Destacados" },
  { value: "newest", param: "recientes", label: "Más recientes" },
  { value: "price_asc", param: "precio-menor", label: "Precio: menor a mayor" },
  { value: "price_desc", param: "precio-mayor", label: "Precio: mayor a menor" },
  { value: "bestsellers", param: "mas-vendidos", label: "Más vendidos" },
];

export const availabilityOptions: { value: ProductAvailability; param: string; label: string }[] = [
  { value: "in_stock", param: "disponible", label: "Disponible" },
  { value: "low_stock", param: "pocas-unidades", label: "Últimas unidades" },
  { value: "on_request", param: "bajo-pedido", label: "Bajo pedido" },
  { value: "out_of_stock", param: "agotado", label: "Agotado" },
];

export const kindOptions: { value: ProductKind; param: string; label: string }[] = [
  { value: "retail", param: "general", label: "Venta directa" },
  { value: "corporate", param: "empresarial", label: "Empresarial / proyecto" },
  { value: "consumable", param: "consumible", label: "Consumible / reposición" },
];

function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function first(value: string | string[] | undefined): string {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value).trim();
}

export function parseShopParams(params: RawParams): ShopState {
  const q = first(params.q);
  const categoria = first(params.categoria);
  const subcategoria = first(params.subcategoria);
  const marcas = toList(params.marca);
  const min = first(params.min);
  const max = first(params.max);
  const disponibilidad = toList(params.disponibilidad);
  const tipo = toList(params.tipo);
  const oferta = first(params.oferta) === "1";

  const sort =
    sortOptions.find((option) => option.param === first(params.orden))?.value ?? "featured";
  const view = first(params.vista) === "lista" ? "list" : "grid";
  const page = Math.max(1, Number.parseInt(first(params.pagina) || "1", 10) || 1);

  const availability = disponibilidad
    .map((param) => availabilityOptions.find((option) => option.param === param)?.value)
    .filter((value): value is ProductAvailability => Boolean(value));

  const kinds = tipo
    .map((param) => kindOptions.find((option) => option.param === param)?.value)
    .filter((value): value is ProductKind => Boolean(value));

  return {
    filters: {
      query: q || undefined,
      category: categoria || undefined,
      subcategory: subcategoria || undefined,
      brands: marcas.length ? marcas : undefined,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      availability: availability.length ? availability : undefined,
      kinds: kinds.length ? kinds : undefined,
      onSale: oferta || undefined,
    },
    sort,
    view,
    page,
    raw: { q, categoria, subcategoria, marcas, min, max, disponibilidad, tipo, oferta },
  };
}

/** Construye un query string a partir de valores parciales, limpiando vacíos. */
export function buildQuery(
  current: URLSearchParams,
  updates: Record<string, string | string[] | null>,
): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.set(key, value.join(","));
    } else {
      next.set(key, value);
    }
  }

  // Cualquier cambio de filtro reinicia la paginación.
  if (!("pagina" in updates)) next.delete("pagina");

  const query = next.toString();
  return query ? `?${query}` : "";
}

export const PAGE_SIZE = 12;

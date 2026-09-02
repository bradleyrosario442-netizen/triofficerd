import type { ProductFilters, SortKey } from "@/lib/types";

/**
 * Traducción entre la URL y el estado del catálogo.
 *
 * Mantener los filtros en la URL hace que cada vista sea enlazable, indexable
 * y compartible. El catálogo es de cotización, así que no hay parámetros de
 * precio ni de oferta.
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
  };
}

export const sortOptions: { value: SortKey; param: string; label: string }[] = [
  { value: "relevance", param: "relevancia", label: "Relevancia" },
  { value: "name_asc", param: "nombre-az", label: "Nombre: A – Z" },
  { value: "name_desc", param: "nombre-za", label: "Nombre: Z – A" },
  { value: "brand", param: "marca", label: "Marca" },
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

  const sort = sortOptions.find((option) => option.param === first(params.orden))?.value ?? "relevance";
  const view = first(params.vista) === "lista" ? "list" : "grid";
  const page = Math.max(1, Number.parseInt(first(params.pagina) || "1", 10) || 1);

  return {
    filters: {
      query: q || undefined,
      category: categoria || undefined,
      subcategory: subcategoria || undefined,
      brands: marcas.length ? marcas : undefined,
    },
    sort,
    view,
    page,
    raw: { q, categoria, subcategoria, marcas },
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

export const PAGE_SIZE = 24;

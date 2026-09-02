import { categories, megaMenuHighlights } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import { products } from "@/lib/data/products";
import type {
  Brand,
  Category,
  Paginated,
  Product,
  ProductFilters,
  SearchResults,
  SortKey,
  Subcategory,
} from "@/lib/types";

/* ==========================================================================
   Capa de acceso a datos del catálogo.
   Hoy resuelve contra los arreglos en `lib/data`. Al conectar Supabase se
   reimplementa aquí (mismas firmas) y la UI no se toca.
   ========================================================================== */

/* ------------------------------ Categorías ------------------------------ */

export function getCategories(): Category[] {
  return categories;
}

export function getHighlightedCategories(): Category[] {
  return categories.filter((c) => c.highlighted);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): Subcategory | undefined {
  return getCategory(categorySlug)?.subcategories.find((s) => s.slug === subcategorySlug);
}

/** Subcategorías destacadas de una categoría, para el mega menú. */
export function getMenuSubcategories(categorySlug: string, limit = 7): Subcategory[] {
  const category = getCategory(categorySlug);
  if (!category) return [];
  const highlights = megaMenuHighlights[categorySlug];
  if (!highlights) return category.subcategories.slice(0, limit);
  const ordered = highlights
    .map((slug) => category.subcategories.find((s) => s.slug === slug))
    .filter((s): s is Subcategory => Boolean(s));
  return ordered.slice(0, limit);
}

export function countProductsInCategory(categorySlug: string): number {
  return products.filter((p) => p.category === categorySlug).length;
}

/* -------------------------------- Marcas -------------------------------- */

export function getBrands(): Brand[] {
  return brands;
}

export function getBrand(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getBrandName(slug: string): string {
  return getBrand(slug)?.name ?? slug;
}

/** Marcas que tienen al menos un producto publicado. */
export function getActiveBrands(): Brand[] {
  const used = new Set(products.map((p) => p.brand));
  return brands.filter((b) => used.has(b.slug));
}

export function getBrandsForCategory(categorySlug?: string): Brand[] {
  const scope = categorySlug ? products.filter((p) => p.category === categorySlug) : products;
  const used = new Set(scope.map((p) => p.brand));
  return brands.filter((b) => used.has(b.slug));
}

/* ------------------------------- Productos ------------------------------ */

export function getProducts(): Product[] {
  return products;
}

/** Índices por slug e id: el catálogo tiene miles de entradas y las fichas
 *  se renderizan bajo demanda, así que no conviene recorrerlo en cada visita. */
const bySlug = new Map(products.map((product) => [product.slug, product]));
const byId = new Map(products.map((product) => [product.id, product]));

export function getProductBySlug(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getProductById(id: string): Product | undefined {
  return byId.get(id);
}

export function getProductsByIds(ids: string[]): Product[] {
  const set = new Set(ids);
  return products.filter((p) => set.has(p.id));
}

/**
 * Selección para la portada.
 *
 * El catálogo es de cotización: no hay ofertas, ni más vendidos, ni fechas de
 * alta reales. Para que las secciones muestren variedad en lugar de las
 * primeras filas del archivo, se toma un producto por subcategoría en rotación.
 */
function spread(limit: number, offset = 0): Product[] {
  const bySub = new Map<string, Product[]>();
  for (const product of products) {
    const list = bySub.get(product.subcategory) ?? [];
    list.push(product);
    bySub.set(product.subcategory, list);
  }

  const groups = [...bySub.values()];
  const picked: Product[] = [];
  for (let round = 0; picked.length < limit && round < 40; round += 1) {
    for (const group of groups) {
      const item = group[(round + offset) % group.length];
      if (item && !picked.includes(item)) picked.push(item);
      if (picked.length === limit) break;
    }
  }
  return picked;
}

export function getFeaturedProducts(limit = 8): Product[] {
  return spread(limit, 0);
}

export function getNewArrivals(limit = 8): Product[] {
  return spread(limit, 1);
}

export function getOnSaleProducts(limit = 8): Product[] {
  return spread(limit, 2);
}

export function getBestsellers(limit = 8): Product[] {
  return spread(limit, 3);
}

export function getProductsByCategory(categorySlug: string, limit?: number): Product[] {
  const list = products.filter((p) => p.category === categorySlug);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameSubcategory = products.filter(
    (p) => p.id !== product.id && p.category === product.category && p.subcategory === product.subcategory,
  );
  const sameBrand = products.filter(
    (p) => p.id !== product.id && p.brand === product.brand && !sameSubcategory.includes(p),
  );
  return [...sameSubcategory, ...sameBrand].slice(0, limit);
}

export function getCategorySiblings(product: Product, limit = 8): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

/* -------------------------- Filtrado y ordenado ------------------------- */

function matchesQuery(product: Product, query: string): boolean {
  const haystack = [
    product.name,
    product.shortDescription,
    product.sku,
    getBrandName(product.brand),
    getCategory(product.category)?.name ?? "",
    getSubcategory(product.category, product.subcategory)?.name ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => normalize(haystack).includes(token));
}

export function filterProducts(filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.subcategory && product.subcategory !== filters.subcategory) return false;
    if (filters.brands?.length && !filters.brands.includes(product.brand)) return false;
    if (filters.query && !matchesQuery(product, filters.query)) return false;
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const items = [...list];
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "es");

  switch (sort) {
    case "name_asc":
      return items.sort(byName);
    case "name_desc":
      return items.sort((a, b) => byName(b, a));
    case "brand":
      return items.sort((a, b) => a.brand.localeCompare(b.brand, "es") || byName(a, b));
    case "relevance":
    default:
      return items;
  }
}

export function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    total: items.length,
    page: current,
    pageSize,
    pages,
  };
}

/* -------------------------------- Búsqueda ------------------------------ */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Búsqueda global: productos, categorías (y subcategorías) y marcas. */
export function search(rawQuery: string, limit = 6): SearchResults {
  const query = rawQuery.trim();
  if (query.length < 2) {
    return { products: [], categories: [], brands: [], total: 0 };
  }

  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const matches = (haystack: string) => {
    const value = normalize(haystack);
    return tokens.every((token) => value.includes(token));
  };

  const scored = products
    .map((product) => {
      const brandName = getBrandName(product.brand);
      const subName = getSubcategory(product.category, product.subcategory)?.name ?? "";
      const catName = getCategory(product.category)?.name ?? "";
      const fields = `${product.name} ${brandName} ${subName} ${catName} ${product.sku} ${product.shortDescription}`;
      if (!matches(fields)) return null;

      let score = 0;
      if (matches(product.name)) score += 6;
      if (normalize(product.name).startsWith(normalize(query))) score += 4;
      if (matches(brandName)) score += 3;
      if (matches(subName)) score += 2;
      if (matches(product.sku)) score += 5;
      return { product, score };
    })
    .filter((entry): entry is { product: Product; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score);

  const matchedCategories = categories.filter(
    (category) =>
      matches(category.name) || category.subcategories.some((sub) => matches(sub.name)),
  );

  const matchedBrands = getActiveBrands().filter((brand) => matches(brand.name));

  return {
    products: scored.slice(0, limit).map((entry) => entry.product),
    categories: matchedCategories.slice(0, 4),
    brands: matchedBrands.slice(0, 4),
    total: scored.length + matchedCategories.length + matchedBrands.length,
  };
}

/** Sugerencias mostradas antes de que el usuario escriba. */
export const popularSearches = [
  "Laptop",
  "Tóner HP",
  "Escritorio",
  "Resma de papel",
  "Silla ejecutiva",
  "Impresora",
];

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

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByIds(ids: string[]): Product[] {
  const set = new Set(ids);
  return products.filter((p) => set.has(p.id));
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getNewArrivals(limit = 8): Product[] {
  return [...products]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

export function getOnSaleProducts(limit = 8): Product[] {
  return products.filter((p) => p.sale).slice(0, limit);
}

export function getBestsellers(limit = 8): Product[] {
  return products.filter((p) => p.bestseller).slice(0, limit);
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

/** Rango de precios disponible, para el filtro del catálogo. */
export function getPriceRange(categorySlug?: string): { min: number; max: number } {
  const scope = categorySlug ? products.filter((p) => p.category === categorySlug) : products;
  const prices = scope.map((p) => p.price).filter((p): p is number => typeof p === "number");
  if (!prices.length) return { min: 0, max: 0 };
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
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
    if (filters.availability?.length && !filters.availability.includes(product.availability)) return false;
    if (filters.kinds?.length && !filters.kinds.includes(product.kind)) return false;
    if (filters.onSale && !product.sale) return false;
    if (typeof filters.minPrice === "number" && (product.price ?? 0) < filters.minPrice) return false;
    if (typeof filters.maxPrice === "number" && product.price !== null && product.price > filters.maxPrice)
      return false;
    if (filters.query && !matchesQuery(product, filters.query)) return false;
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const items = [...list];
  switch (sort) {
    case "newest":
      return items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case "price_asc":
      return items.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "price_desc":
      return items.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    case "bestsellers":
      return items.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
    case "featured":
    default:
      return items.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || Number(b.bestseller) - Number(a.bestseller),
      );
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
      if (product.featured) score += 1;
      if (product.bestseller) score += 1;
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

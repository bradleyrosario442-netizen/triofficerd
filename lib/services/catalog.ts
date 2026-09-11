import {
  readPublishedState,
  readState,
  type AddedProduct,
  type AdminState,
  type ProductPatch,
} from "@/lib/admin/overlay";
import { storage } from "@/lib/admin/storage";
import type { ProductInput } from "@/lib/admin/validation";
import { brandLabel, buildBrands } from "@/lib/data/brands";
import { categories, megaMenuHighlights } from "@/lib/data/categories";
import {
  baseProducts,
  illustrationFor,
  isIllustration,
  slugify,
  specificationsFor,
} from "@/lib/data/products";
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
import { uploadedPhotoUrl } from "@/lib/utils/product-image";

/* ==========================================================================
   Capa de acceso a datos del catálogo.
   Lo publicado es el catálogo importado (`lib/data/products.ts`) con los
   cambios del panel aplicados encima (`lib/admin/overlay.ts`). Las funciones
   que devuelven productos son asíncronas porque esos cambios se leen del
   almacén; las de categorías siguen siendo síncronas.
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

/* ------------------------- Combinación de capas ------------------------- */

const baseById = new Map(baseProducts.map((product) => [product.id, product]));
const baseBrandSlugs = new Set(baseProducts.map((product) => product.brand));

export function isBaseProduct(id: string): boolean {
  return baseById.has(id);
}

/** El producto existe en el catálogo base o fue creado en el panel. */
export async function productExists(id: string): Promise<boolean> {
  return baseById.has(id) || Boolean((await readState()).overlay.added[id]);
}

/** Semilla estable para elegir la ilustración de un producto por su id. */
function seedOf(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

type Label = (slug: string) => string;

function applyPatch(product: Product, patch: ProductPatch, label: Label): Product {
  const brand = patch.brandName !== undefined ? slugify(patch.brandName) || product.brand : product.brand;
  const sku = patch.sku !== undefined ? patch.sku || "—" : product.sku;
  const category = patch.category ?? product.category;
  const subcategory = patch.subcategory ?? product.subcategory;
  // Si cambió de subcategoría y aún no tiene foto, la ilustración la acompaña.
  const images =
    subcategory !== product.subcategory && isIllustration(product.images[0])
      ? [illustrationFor(subcategory, seedOf(product.id))]
      : product.images;

  return {
    ...product,
    name: patch.name ?? product.name,
    brand,
    sku,
    category,
    subcategory,
    description: patch.description ?? product.description,
    featured: patch.featured ?? product.featured,
    images,
    specifications: specificationsFor(label(brand), sku, subcategory),
  };
}

function fromAdded(entry: AddedProduct, label: Label): Product {
  const brand = slugify(entry.brandName) || "generico";
  const sku = entry.sku || "—";
  return {
    id: entry.id,
    slug: entry.id,
    sku,
    name: entry.name,
    shortDescription: "",
    description: entry.description,
    category: entry.category,
    subcategory: entry.subcategory,
    brand,
    price: null,
    previousPrice: null,
    stock: 0,
    availability: "on_request",
    images: [illustrationFor(entry.subcategory, seedOf(entry.id))],
    specifications: specificationsFor(label(brand), sku, entry.subcategory),
    features: [],
    kind: "corporate",
    featured: entry.featured,
    bestseller: false,
    isNew: false,
    sale: false,
    quoteOnly: true,
    createdAt: entry.createdAt,
  };
}

function withPhotos(product: Product, files: string[]): Product {
  return files.length
    ? { ...product, images: files.map((file) => uploadedPhotoUrl(product.id, file)) }
    : product;
}

interface MergedRow {
  product: Product;
  origin: "base" | "nuevo";
  edited: boolean;
  hidden: boolean;
  /** Fotos subidas desde el panel. */
  photos: string[];
}

function merge({ overlay, photos }: AdminState): { rows: MergedRow[]; label: Label } {
  // Marcas escritas en el panel que el catálogo base no tiene: se respeta su grafía.
  const typed = new Map<string, string>();
  for (const entry of [...Object.values(overlay.edits), ...Object.values(overlay.added)]) {
    const name = entry.brandName?.trim();
    const slug = name ? slugify(name) : "";
    if (name && slug && !baseBrandSlugs.has(slug) && !typed.has(slug)) typed.set(slug, name);
  }
  const label: Label = (slug) => brandLabel(slug, typed.get(slug));

  const hidden = new Set(overlay.hidden);
  const rows: MergedRow[] = [];

  for (const base of baseProducts) {
    const patch = overlay.edits[base.id];
    const files = photos.productos[base.id] ?? [];
    rows.push({
      product: withPhotos(patch ? applyPatch(base, patch, label) : base, files),
      origin: "base",
      edited: Boolean(patch && Object.keys(patch).length > 0),
      hidden: hidden.has(base.id),
      photos: files,
    });
  }

  for (const entry of Object.values(overlay.added)) {
    if (baseById.has(entry.id)) continue;
    const files = photos.productos[entry.id] ?? [];
    rows.push({
      product: withPhotos(fromAdded(entry, label), files),
      origin: "nuevo",
      edited: false,
      hidden: false,
      photos: files,
    });
  }

  return { rows, label };
}

/* ------------------------------- Publicado ------------------------------ */

interface Catalog {
  products: Product[];
  bySlug: Map<string, Product>;
  byId: Map<string, Product>;
  brands: Brand[];
  names: Map<string, string>;
}

/**
 * Catálogo combinado del proceso. Se recalcula solo cuando cambia la versión
 * de los datos del panel; entre cambios, todas las visitas comparten el mismo.
 */
let published: { version: string; catalog: Catalog } | null = null;

async function getCatalog(): Promise<Catalog> {
  const state = await readPublishedState();
  const version = `${state.overlay.updatedAt ?? "-"}|${state.photos.updatedAt ?? "-"}`;
  if (!published || published.version !== version) {
    const { rows, label } = merge(state);
    const products = rows.filter((row) => !row.hidden).map((row) => row.product);
    const brands = buildBrands(products, label);
    published = {
      version,
      catalog: {
        products,
        bySlug: new Map(products.map((product) => [product.slug, product])),
        byId: new Map(products.map((product) => [product.id, product])),
        brands,
        names: new Map(brands.map((brand) => [brand.slug, brand.name])),
      },
    };
  }
  return published.catalog;
}

export async function countProductsInCategory(categorySlug: string): Promise<number> {
  return (await getCatalog()).products.filter((p) => p.category === categorySlug).length;
}

/* -------------------------------- Marcas -------------------------------- */

/** Marcas con al menos un producto publicado. */
export async function getBrands(): Promise<Brand[]> {
  return (await getCatalog()).brands;
}

export async function getBrand(slug: string): Promise<Brand | undefined> {
  return (await getCatalog()).brands.find((b) => b.slug === slug);
}

/**
 * Nombre visible de una marca. Es síncrono porque lo llaman las tarjetas al
 * renderizar productos que ya salieron de `getCatalog()`.
 */
export function getBrandName(slug: string): string {
  return published?.catalog.names.get(slug) ?? brandLabel(slug);
}

export const getActiveBrands = getBrands;

export async function getBrandsForCategory(categorySlug?: string): Promise<Brand[]> {
  const { products, brands } = await getCatalog();
  if (!categorySlug) return brands;
  const used = new Set(products.filter((p) => p.category === categorySlug).map((p) => p.brand));
  return brands.filter((b) => used.has(b.slug));
}

/* ------------------------------- Productos ------------------------------ */

export async function getProducts(): Promise<Product[]> {
  return (await getCatalog()).products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getCatalog()).bySlug.get(slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return (await getCatalog()).byId.get(id);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const set = new Set(ids);
  return (await getCatalog()).products.filter((p) => set.has(p.id));
}

const hasPhoto = (product: Product) => !isIllustration(product.images[0]);

/**
 * Selección para la portada.
 *
 * El catálogo es de cotización: no hay ofertas, ni más vendidos, ni fechas de
 * alta reales. Para que las secciones muestren variedad en lugar de las
 * primeras filas del archivo, se toma un producto por subcategoría en rotación.
 * Dentro de cada subcategoría van primero los que ya tienen foto, para que la
 * portada muestre el catálogo real en cuanto se suben las primeras.
 */
function spread(products: Product[], limit: number, offset = 0): Product[] {
  const bySub = new Map<string, Product[]>();
  for (const product of products) {
    const list = bySub.get(product.subcategory) ?? [];
    list.push(product);
    bySub.set(product.subcategory, list);
  }

  const groups = [...bySub.values()].map((group) => [
    ...group.filter(hasPhoto),
    ...group.filter((product) => !hasPhoto(product)),
  ]);
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

/** Primero los que se marcaron como destacados en el panel. */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await getCatalog();
  const featured = products.filter((p) => p.featured);
  const rest = spread(products, limit + featured.length, 0).filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return spread((await getCatalog()).products, limit, 1);
}

export async function getOnSaleProducts(limit = 8): Promise<Product[]> {
  return spread((await getCatalog()).products, limit, 2);
}

export async function getBestsellers(limit = 8): Promise<Product[]> {
  return spread((await getCatalog()).products, limit, 3);
}

export async function getProductsByCategory(categorySlug: string, limit?: number): Promise<Product[]> {
  const list = (await getCatalog()).products.filter((p) => p.category === categorySlug);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { products } = await getCatalog();
  const sameSubcategory = products.filter(
    (p) => p.id !== product.id && p.category === product.category && p.subcategory === product.subcategory,
  );
  const sameBrand = products.filter(
    (p) => p.id !== product.id && p.brand === product.brand && !sameSubcategory.includes(p),
  );
  return [...sameSubcategory, ...sameBrand].slice(0, limit);
}

export async function getCategorySiblings(product: Product, limit = 8): Promise<Product[]> {
  return (await getCatalog()).products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

/* -------------------------- Filtrado y ordenado ------------------------- */

function matchesQuery(product: Product, query: string): boolean {
  const haystack = [
    product.name,
    product.shortDescription,
    product.description,
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

export async function filterProducts(filters: ProductFilters): Promise<Product[]> {
  return (await getCatalog()).products.filter((product) => {
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

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Búsqueda global: productos, categorías (y subcategorías) y marcas. */
export async function search(rawQuery: string, limit = 6): Promise<SearchResults> {
  const query = rawQuery.trim();
  if (query.length < 2) {
    return { products: [], categories: [], brands: [], total: 0 };
  }

  const { products, brands } = await getCatalog();
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

  const matchedBrands = brands.filter((brand) => matches(brand.name));

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

/* ---------------------------- Administración ---------------------------- */

export interface AdminProduct {
  product: Product;
  origin: "base" | "nuevo";
  edited: boolean;
  hidden: boolean;
  photos: string[];
  /** Valores actuales, en la forma del formulario. */
  input: ProductInput;
  /** Valores del catálogo importado; `null` en productos creados en el panel. */
  original: ProductInput | null;
}

function inputOf(product: Product, label: Label): ProductInput {
  return {
    name: product.name,
    brandName: label(product.brand),
    sku: product.sku === "—" ? "" : product.sku,
    category: product.category,
    subcategory: product.subcategory,
    description: product.description,
    featured: product.featured,
  };
}

/** Todo el catálogo, incluidos los eliminados, leído sin caché. */
export async function getAdminCatalog() {
  const { rows, label } = merge(await readState());
  const items: AdminProduct[] = rows.map((row) => {
    const base = row.origin === "base" ? baseById.get(row.product.id) : undefined;
    return {
      ...row,
      input: inputOf(row.product, label),
      original: base ? inputOf(base, label) : null,
    };
  });
  return {
    items,
    byId: new Map(items.map((item) => [item.product.id, item])),
    brandNames: [...new Set(items.map((item) => item.input.brandName))].sort((a, b) =>
      a.localeCompare(b, "es"),
    ),
    storageKind: storage().kind,
  };
}

/** Valores originales de un producto del catálogo importado. */
export function baseInput(id: string): ProductInput | null {
  const base = baseById.get(id);
  return base ? inputOf(base, (slug) => brandLabel(slug)) : null;
}

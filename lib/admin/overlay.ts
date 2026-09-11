import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { storage } from "@/lib/admin/storage";

/**
 * Cambios hechos desde el panel.
 *
 * El catálogo importado (`data/products.json`) no se modifica nunca: el panel
 * guarda por encima lo que cambió —ediciones, productos nuevos, eliminados y
 * fotos— y el sitio combina ambas capas al leer. Así un error en el panel no
 * puede estropear el catálogo base, y cada cambio se puede revertir.
 *
 * Son dos documentos. Las fotos van aparte porque la subida masiva escribe
 * muchas veces seguidas y no debe competir con quien está editando un título.
 */

export interface ProductPatch {
  name?: string;
  brandName?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  featured?: boolean;
}

export interface AddedProduct extends Required<ProductPatch> {
  id: string;
  createdAt: string;
}

export interface CatalogOverlay {
  /** Cambios sobre productos del catálogo base, por id. */
  edits: Record<string, ProductPatch>;
  /** Productos creados desde el panel. */
  added: Record<string, AddedProduct>;
  /** Productos del catálogo base retirados del sitio. */
  hidden: string[];
  updatedAt: string | null;
}

export interface PhotoIndex {
  /** Archivos de cada producto, en orden: el primero es la portada. */
  productos: Record<string, string[]>;
  updatedAt: string | null;
}

export interface AdminState {
  overlay: CatalogOverlay;
  photos: PhotoIndex;
}

const OVERLAY_KEY = "catalogo";
const PHOTOS_KEY = "fotos-indice";
export const CATALOG_TAG = "catalogo";

/** Un documento vacío o de otra versión no debe romper el sitio. */
function asOverlay(value: unknown): CatalogOverlay {
  const doc = (value ?? {}) as Partial<CatalogOverlay>;
  return {
    edits: doc.edits && typeof doc.edits === "object" ? doc.edits : {},
    added: doc.added && typeof doc.added === "object" ? doc.added : {},
    hidden: Array.isArray(doc.hidden) ? doc.hidden : [],
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : null,
  };
}

function asPhotos(value: unknown): PhotoIndex {
  const doc = (value ?? {}) as Partial<PhotoIndex>;
  return {
    productos: doc.productos && typeof doc.productos === "object" ? doc.productos : {},
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : null,
  };
}

/** Estado actual, sin caché: lo que usa el panel. */
export async function readState(): Promise<AdminState> {
  const store = storage();
  const [overlay, photos] = await Promise.all([
    store.getJSON(OVERLAY_KEY),
    store.getJSON(PHOTOS_KEY),
  ]);
  return { overlay: asOverlay(overlay.data), photos: asPhotos(photos.data) };
}

/**
 * Estado para el sitio público: queda en caché hasta que el panel publique un
 * cambio (`publish`). Sin esto, cada visita consultaría el almacén.
 */
export const readPublishedState = unstable_cache(readState, ["admin-state-v1"], {
  tags: [CATALOG_TAG],
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lee, modifica y escribe con bloqueo optimista: si otra petición escribió en
 * medio, se vuelve a leer y se reintenta. Dos pestañas guardando a la vez, o
 * dos fotos subiendo en paralelo, no se pisan.
 */
async function mutate<T extends { updatedAt: string | null }>(
  key: string,
  parse: (value: unknown) => T,
  change: (current: T) => void,
): Promise<T> {
  const store = storage();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const entry = await store.getJSON(key);
    const next = parse(entry.data);
    change(next);
    next.updatedAt = new Date().toISOString();
    if (await store.setJSONIf(key, next, entry.etag)) return next;
    await wait(50 + Math.random() * 150 * (attempt + 1));
  }
  throw new Error("Otra sesión está guardando cambios al mismo tiempo. Intenta de nuevo.");
}

export const updateOverlay = (change: (overlay: CatalogOverlay) => void) =>
  mutate(OVERLAY_KEY, asOverlay, change);

export const updatePhotos = (change: (photos: PhotoIndex) => void) =>
  mutate(PHOTOS_KEY, asPhotos, change);

/** Publica los cambios: invalida la caché de datos y las páginas generadas. */
export function publish(): void {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

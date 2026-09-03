import { NextResponse } from "next/server";
import { getBrandName, getCategory, getSubcategory, search } from "@/lib/services/catalog";

/**
 * Búsqueda global.
 *
 * Mantener el catálogo en el servidor evita enviar todo el inventario al
 * navegador y deja el punto listo para consultar Supabase más adelante.
 *
 * Es el único endpoint público que ejecuta código, así que está acotado por
 * tres lados: longitud de la consulta, número de términos y frecuencia de
 * llamada. Sin esos topes, una consulta larga cuyos términos coincidan con
 * casi todo obliga a recorrer los 2.862 productos una vez por término.
 */

/** Una consulta real no pasa de unos pocos términos cortos. */
const MAX_QUERY_LENGTH = 80;
const MAX_TOKENS = 10;

/** Ventana de limitación por IP. */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

/**
 * Contador en memoria del proceso.
 *
 * En Netlify cada instancia tiene el suyo, así que esto frena el abuso desde
 * un cliente pero no sustituye a un limitador en el borde. Ver el README.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });

    // Poda perezosa para que el mapa no crezca sin control.
    if (hits.size > 5_000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= MAX_REQUESTS,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Identifica al cliente sin registrar la IP completa en ningún log. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for") ??
    "";
  return forwarded.split(",")[0].trim() || "desconocido";
}

const empty = {
  query: "",
  total: 0,
  products: [],
  categories: [],
  brands: [],
  suggestions: [],
};

export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";

  // Se recorta antes de tocar el catálogo: el coste no puede depender de la
  // longitud de lo que envíe el cliente.
  const query = raw.slice(0, MAX_QUERY_LENGTH).trim();
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > MAX_TOKENS) {
    return NextResponse.json(empty);
  }

  const results = search(query, 6);

  return NextResponse.json({
    query,
    total: results.total,
    products: results.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: getBrandName(product.brand),
      image: product.images[0],
      subcategory: getSubcategory(product.category, product.subcategory)?.name ?? "",
    })),
    categories: results.categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category.subcategories.length,
    })),
    brands: results.brands.map((brand) => ({ slug: brand.slug, name: brand.name })),
    suggestions: results.categories
      .flatMap((category) =>
        category.subcategories
          .filter((sub) => sub.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map((sub) => ({
            label: sub.name,
            href: `/categoria/${category.slug}/${sub.slug}`,
            parent: getCategory(category.slug)?.name ?? "",
          })),
      )
      .slice(0, 5),
  });
}

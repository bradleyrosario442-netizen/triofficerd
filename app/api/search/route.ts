import { NextResponse } from "next/server";
import { getBrandName, getCategory, getSubcategory, search } from "@/lib/services/catalog";

/**
 * Búsqueda global.
 * Mantener el catálogo en el servidor evita enviar todo el inventario al
 * navegador y deja el punto listo para consultar Supabase más adelante.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
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
      price: product.price,
      previousPrice: product.previousPrice,
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
          .filter((sub) => sub.name.toLowerCase().includes(query.trim().toLowerCase()))
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

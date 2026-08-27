import type { MetadataRoute } from "next";
import { categories } from "@/lib/data/categories";
import { site } from "@/lib/data/site";
import { getProducts } from "@/lib/services/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/tienda`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/empresas`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/cotizacion`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/nosotros`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/marcas`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/ayuda/preguntas-frecuentes`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/ayuda/envios`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${site.url}/ayuda/garantia`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${site.url}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/legal/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((category) => [
    {
      url: `${site.url}/categoria/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...category.subcategories.map((subcategory) => ({
      url: `${site.url}/categoria/${category.slug}/${subcategory.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const productRoutes: MetadataRoute.Sitemap = getProducts().map((product) => ({
    url: `${site.url}/producto/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

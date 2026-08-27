import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/shop/catalog-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { categories } from "@/lib/data/categories";
import { getCategory, getSubcategory } from "@/lib/services/catalog";
import { parseShopParams, type RawParams } from "@/lib/services/shop-params";

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<RawParams>;
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      category: category.slug,
      subcategory: subcategory.slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const category = getCategory(categorySlug);
  const subcategory = getSubcategory(categorySlug, subcategorySlug);
  if (!category || !subcategory) return { title: "Subcategoría no encontrada" };

  const description = `${subcategory.name} en ${category.name}. Cotiza o compra en línea con entrega en toda República Dominicana.`;

  return {
    title: `${subcategory.name} — ${category.name}`,
    description,
    alternates: { canonical: `/categoria/${category.slug}/${subcategory.slug}` },
    openGraph: {
      title: `${subcategory.name} | ${category.name} | Tri Office`,
      description,
      url: `/categoria/${category.slug}/${subcategory.slug}`,
    },
  };
}

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const category = getCategory(categorySlug);
  const subcategory = getSubcategory(categorySlug, subcategorySlug);
  if (!category || !subcategory) notFound();

  const state = parseShopParams(await searchParams);

  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs
            items={[
              { label: "Tienda", href: "/tienda" },
              { label: category.name, href: `/categoria/${category.slug}` },
              { label: subcategory.name },
            ]}
          />

          <div className="mt-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-600">
              {category.name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
              {subcategory.name}
            </h1>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
              {subcategory.description ??
                `Productos de ${subcategory.name.toLowerCase()} disponibles dentro de nuestra línea de ${category.name.toLowerCase()}.`}
            </p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            <li>
              <Link
                href={`/categoria/${category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-brand-700 transition-colors hover:border-brand-300"
              >
                <Icon name="arrow-left" size={14} />
                Toda la categoría
              </Link>
            </li>
            {category.subcategories
              .filter((entry) => entry.slug !== subcategory.slug)
              .slice(0, 8)
              .map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/categoria/${category.slug}/${entry.slug}`}
                    className="inline-flex items-center rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    {entry.name}
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-canvas" />}>
          <CatalogView
            state={state}
            basePath={`/categoria/${category.slug}/${subcategory.slug}`}
            lockedCategory={category.slug}
            lockedSubcategory={subcategory.slug}
          />
        </Suspense>
      </Container>
    </>
  );
}

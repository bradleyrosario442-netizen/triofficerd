import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/shop/catalog-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { categories } from "@/lib/data/categories";
import { countProductsInCategory, getCategory } from "@/lib/services/catalog";
import { parseShopParams, type RawParams } from "@/lib/services/shop-params";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<RawParams>;
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Categoría no encontrada" };

  return {
    title: `${category.name} — ${category.tagline}`,
    description: category.description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: `${category.name} | Tri Office`,
      description: category.description,
      url: `/categoria/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const state = parseShopParams(await searchParams);
  const total = countProductsInCategory(category.slug);

  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Tienda", href: "/tienda" }, { label: category.name }]} />

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 shadow-card">
                  <Icon name={category.icon} size={21} />
                </span>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-600">
                    {category.tagline}
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
                    {category.name}
                  </h1>
                </div>
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{category.description}</p>
              <p className="mt-2 text-[13px] text-muted">
                {category.subcategories.length} subcategorías · {total} productos publicados
              </p>
            </div>
          </div>

          {/* Subcategorías: navegación rápida y enlaces indexables */}
          <ul className="mt-6 flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <li key={subcategory.slug}>
                <Link
                  href={`/categoria/${category.slug}/${subcategory.slug}`}
                  className="inline-flex items-center rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  {subcategory.name}
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
            basePath={`/categoria/${category.slug}`}
            lockedCategory={category.slug}
          />
        </Suspense>
      </Container>
    </>
  );
}

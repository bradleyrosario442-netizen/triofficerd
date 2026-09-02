import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { site } from "@/lib/data/site";
import {
  getBrandName,
  getCategory,
  getCategorySiblings,
  getProductBySlug,
  getRelatedProducts,
  getSubcategory,
} from "@/lib/services/catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * El catálogo tiene miles de fichas, así que no se prerenderizan todas: la
 * primera visita construye la página y queda cacheada.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const brandName = getBrandName(product.brand);
  const categoryName = getSubcategory(product.category, product.subcategory)?.name ?? "";
  const description = `${brandName} ${product.name}. ${categoryName} disponible por cotización en ${site.name}, República Dominicana.`;

  return {
    title: `${brandName} ${product.name}`,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${brandName} ${product.name} | ${site.name}`,
      description,
      url: `/producto/${product.slug}`,
      images: [{ url: product.images[0] }],
    },
  };
}

const notes = [
  {
    icon: "quote" as const,
    title: "Precio por cotización",
    text: "El precio depende de la cantidad y la configuración solicitada.",
  },
  {
    icon: "truck" as const,
    title: "Entrega en todo el país",
    text: "Coordinamos el despacho a Santo Domingo y al interior.",
  },
  {
    icon: "shield" as const,
    title: "Garantía del fabricante",
    text: "Los equipos incluyen la garantía que indica cada fabricante.",
  },
];

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const subcategory = getSubcategory(product.category, product.subcategory);
  const brandName = getBrandName(product.brand);
  const related = getRelatedProducts(product, 4);
  const siblings = getCategorySiblings(product, 4);

  // Sin precio publicado no se declara `offers`: el dato no existe.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.sku && product.sku !== "—" ? { sku: product.sku, mpn: product.sku } : {}),
    brand: { "@type": "Brand", name: brandName },
    image: product.images.map((image) => `${site.url}${image}`),
    category: subcategory?.name ?? category?.name,
    url: `${site.url}/producto/${product.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="border-b border-line bg-canvas">
        <Container className="py-5">
          <Breadcrumbs
            items={[
              { label: "Catálogo", href: "/tienda" },
              ...(category ? [{ label: category.name, href: `/categoria/${category.slug}` }] : []),
              ...(category && subcategory
                ? [{ label: subcategory.name, href: `/categoria/${category.slug}/${subcategory.slug}` }]
                : []),
              { label: product.name },
            ]}
          />
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-12">
          <ProductGallery product={product} />

          <div>
            <Link
              href={`/tienda?marca=${product.brand}`}
              className="text-[12px] font-bold uppercase tracking-[0.12em] text-brand-600 hover:text-brand-800"
            >
              {brandName}
            </Link>

            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-[28px]">
              {product.name}
            </h1>

            <dl className="mt-5 grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
              {product.sku && product.sku !== "—" ? (
                <div className="flex gap-2">
                  <dt className="text-muted">Número de parte:</dt>
                  <dd className="font-medium text-ink">{product.sku}</dd>
                </div>
              ) : null}
              <div className="flex gap-2">
                <dt className="text-muted">Categoría:</dt>
                <dd className="font-medium text-ink">{subcategory?.name ?? category?.name}</dd>
              </div>
            </dl>

            <ProductActions product={product} />

            <ul className="mt-7 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
              {notes.map((note) => (
                <li key={note.title} className="flex gap-2.5">
                  <Icon name={note.icon} size={18} className="mt-0.5 shrink-0 text-brand-700" />
                  <span>
                    <span className="block text-[13px] font-medium text-ink">{note.title}</span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">
                      {note.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 max-w-3xl border-t border-line pt-10">
          <h2 className="text-lg font-semibold text-ink">Ficha del producto</h2>
          <dl className="mt-3 overflow-hidden rounded-2xl border border-line">
            {product.specifications.map((spec, index) => (
              <div
                key={spec.label}
                className={`flex gap-4 px-4 py-3 text-[13.5px] ${
                  index % 2 === 0 ? "bg-white" : "bg-canvas"
                }`}
              >
                <dt className="w-2/5 shrink-0 text-muted">{spec.label}</dt>
                <dd className="flex-1 font-medium text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            Las especificaciones completas se confirman en la cotización, junto con el precio, la
            disponibilidad y el tiempo de entrega.
          </p>
        </div>
      </Container>

      {related.length > 0 ? (
        <Section tone="canvas" padding="compact" className="border-t border-line">
          <Container>
            <SectionHeading title="Productos relacionados" className="mb-6" />
            <ProductGrid products={related} />
          </Container>
        </Section>
      ) : null}

      {siblings.length > 0 ? (
        <Section padding="compact">
          <Container>
            <SectionHeading
              title={`Más en ${category?.name ?? "esta categoría"}`}
              action={
                category ? { href: `/categoria/${category.slug}`, label: "Ver la categoría" } : undefined
              }
              className="mb-6"
            />
            <ProductGrid products={siblings} />
          </Container>
        </Section>
      ) : null}
    </>
  );
}

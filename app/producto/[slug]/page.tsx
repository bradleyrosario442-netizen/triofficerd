import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product/product-actions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { AvailabilityLabel, PriceTag } from "@/components/product/price";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { site } from "@/lib/data/site";
import {
  getBrandName,
  getCategory,
  getCategorySiblings,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  getSubcategory,
} from "@/lib/services/catalog";
import { formatCurrency } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | Tri Office`,
      description: product.shortDescription,
      url: `/producto/${product.slug}`,
      images: [{ url: product.images[0] }],
    },
  };
}

const deliveryNotes = [
  {
    icon: "truck" as const,
    title: "Entrega en todo el país",
    text: "Coordinamos el despacho a Santo Domingo y el interior según disponibilidad.",
  },
  {
    icon: "box" as const,
    title: "Retiro en tienda",
    text: "Puedes retirar tu pedido en nuestra sucursal de Santo Domingo Este.",
  },
  {
    icon: "shield" as const,
    title: "Garantía del fabricante",
    text: "Los equipos incluyen la garantía indicada por cada fabricante.",
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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: brandName },
    image: product.images.map((image) => `${site.url}${image}`),
    category: category?.name,
    ...(product.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: site.currency,
            availability:
              product.availability === "out_of_stock"
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: `${site.url}/producto/${product.slug}`,
            seller: { "@type": "Organization", name: site.name },
          },
        }
      : {}),
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
              { label: "Tienda", href: "/tienda" },
              ...(category ? [{ label: category.name, href: `/categoria/${category.slug}` }] : []),
              ...(category && subcategory
                ? [
                    {
                      label: subcategory.name,
                      href: `/categoria/${category.slug}/${subcategory.slug}`,
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-12">
          <div>
            <ProductGallery product={product} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <Link
                href={`/tienda?marca=${product.brand}`}
                className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-600 hover:text-brand-800"
              >
                {brandName}
              </Link>
              <span className="text-[12px] text-slate-300">|</span>
              <span className="text-[12px] text-muted">SKU: {product.sku}</span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">
              {product.name}
            </h1>

            <p className="mt-3 text-[15px] leading-relaxed text-muted">{product.shortDescription}</p>

            <div className="mt-5">
              <PriceTag price={product.price} previousPrice={product.previousPrice} size="lg" />
              {product.price !== null ? (
                <p className="mt-1 text-[12.5px] text-muted">
                  Precio en {site.currencySymbol}. Impuestos calculados en el checkout.
                </p>
              ) : (
                <p className="mt-1 text-[12.5px] text-muted">
                  El precio depende de la configuración y el volumen solicitado.
                </p>
              )}
              <AvailabilityLabel
                availability={product.availability}
                showStock
                stock={product.stock}
                className="mt-3"
              />
            </div>

            <ProductActions product={product} />

            <ul className="mt-6 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
              {deliveryNotes.map((note) => (
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

        {/* Descripción, características y especificaciones */}
        <div className="mt-12 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <div>
            <h2 className="text-lg font-semibold text-ink">Descripción</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{product.description}</p>

            {product.features.length > 0 ? (
              <>
                <h3 className="mt-7 text-[15px] font-semibold text-ink">Características</h3>
                <ul className="mt-3 space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
                      <Icon name="check" size={16} className="mt-1 shrink-0 text-brand-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink">Especificaciones técnicas</h2>
            <dl className="mt-3 overflow-hidden rounded-xl border border-line">
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
              <div className="flex gap-4 bg-white px-4 py-3 text-[13.5px]">
                <dt className="w-2/5 shrink-0 text-muted">Categoría</dt>
                <dd className="flex-1 font-medium text-ink">
                  {category?.name}
                  {subcategory ? ` · ${subcategory.name}` : ""}
                </dd>
              </div>
              {product.unit ? (
                <div className="flex gap-4 bg-canvas px-4 py-3 text-[13.5px]">
                  <dt className="w-2/5 shrink-0 text-muted">Unidad de venta</dt>
                  <dd className="flex-1 font-medium text-ink capitalize">{product.unit}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-5 rounded-xl border border-line bg-canvas p-5">
              <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                <Icon name="quote" size={17} className="text-brand-700" />
                ¿Necesitas varias unidades?
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Para requerimientos por volumen preparamos una cotización con condiciones y tiempos
                de entrega.
                {product.price !== null
                  ? ` Referencia unitaria actual: ${formatCurrency(product.price)}.`
                  : ""}
              </p>
              <Link
                href="/cotizacion"
                className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-[13px] font-medium text-brand-700 transition-colors hover:border-brand-300"
              >
                Ir a mi cotización
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <Section tone="canvas" className="border-t border-line">
          <Container>
            <SectionHeading
              title="Productos relacionados"
              description="Otras opciones dentro de la misma línea."
            />
            <ProductGrid products={related} />
          </Container>
        </Section>
      ) : null}

      {siblings.length > 0 ? (
        <Section>
          <Container>
            <SectionHeading
              title={`Más en ${category?.name ?? "esta categoría"}`}
              action={
                category ? { href: `/categoria/${category.slug}`, label: "Ver la categoría" } : undefined
              }
            />
            <ProductGrid products={siblings} />
          </Container>
        </Section>
      ) : null}
    </>
  );
}

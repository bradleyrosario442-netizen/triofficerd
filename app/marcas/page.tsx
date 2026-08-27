import type { Metadata } from "next";
import Link from "next/link";
import { BrandsStrip } from "@/components/home/brands-strip";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { getActiveBrands, getCategory, getProducts } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Marcas",
  description:
    "Marcas registradas en el catálogo de Tri Office para tecnología, impresión, mobiliario, oficina, limpieza y escolares.",
  alternates: { canonical: "/marcas" },
};

export default function MarcasPage() {
  const brands = getActiveBrands();
  const products = getProducts();

  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Marcas" }]} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-[36px]">
            Marcas con las que trabajamos
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Estas son las marcas registradas en nuestro catálogo. La administración del sitio puede
            agregar nuevas marcas y cargar sus logotipos.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <BrandsStrip brands={brands} />

          <div className="mt-10">
            <SectionHeading
              title="Explora por marca"
              description="Cada marca enlaza a los productos publicados en el catálogo."
            />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => {
                const count = products.filter((product) => product.brand === brand.slug).length;
                return (
                  <li key={brand.slug}>
                    <Link
                      href={`/tienda?marca=${brand.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 transition-all hover:border-brand-200 hover:shadow-lift"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-[16px] font-semibold text-ink">
                          {brand.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                          {brand.categories
                            .map((slug) => getCategory(slug)?.name ?? slug)
                            .join(" · ")}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-md bg-canvas px-2 py-1 text-[12px] text-muted">
                          {count}
                        </span>
                        <Icon
                          name="chevron-right"
                          size={16}
                          className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="canvas" className="border-t border-line">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                ¿Buscas una marca o modelo específico?
              </h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                Nuestro catálogo en línea es una parte de lo que podemos suministrar. Consúltanos por
                el producto que necesitas y te confirmamos disponibilidad.
              </p>
            </div>
            <LinkButton href="/cotizacion" size="lg">
              <Icon name="quote" size={17} />
              Solicitar cotización
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}

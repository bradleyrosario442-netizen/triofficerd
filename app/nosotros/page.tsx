import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { categories } from "@/lib/data/categories";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Tri Office suministra soluciones tecnológicas, mobiliario, equipos y materiales para empresas, instituciones y hogares en República Dominicana.",
  alternates: { canonical: "/nosotros" },
};

const values: { icon: IconGlyph; title: string; text: string }[] = [
  { icon: "shield", title: "Confianza", text: "Cumplimos lo acordado en producto, precio y plazo." },
  { icon: "zap", title: "Innovación", text: "Incorporamos soluciones que mejoran la productividad." },
  { icon: "clock", title: "Eficiencia", text: "Procesos simples para comprar y reponer sin fricción." },
  { icon: "check-circle", title: "Compromiso", text: "Damos seguimiento a cada solicitud hasta la entrega." },
  { icon: "award", title: "Excelencia", text: "Cuidamos la calidad en cada línea del catálogo." },
  { icon: "users", title: "Trabajo en equipo", text: "Coordinación entre asesores, almacén y despacho." },
];

const reasons = [
  {
    title: "Un solo proveedor para toda la operación",
    text: "Tecnología, mobiliario, impresión, suministros, limpieza y escolares en un mismo catálogo.",
  },
  {
    title: "Atención comercial dedicada",
    text: "Un asesor acompaña la solicitud, la cotización y la coordinación de entrega.",
  },
  {
    title: "Cotizaciones empresariales en línea",
    text: "El cliente arma su listado y recibe una propuesta consolidada.",
  },
  {
    title: "Cobertura nacional",
    text: "Despachos coordinados hacia Santo Domingo y el interior del país.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-10 sm:py-14">
          <Breadcrumbs items={[{ label: "Nosotros" }]} />
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-600">
                Quiénes somos
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[42px]">
                Soluciones para empresas, instituciones y hogares
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
                Tri Office se dedica a suministrar soluciones tecnológicas, mobiliario, equipos y
                materiales orientados a mejorar la productividad y la eficiencia de sus clientes en
                República Dominicana.
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-line bg-white p-4">
                <dt className="text-[12px] text-muted">Categorías</dt>
                <dd className="mt-1 text-xl font-semibold text-ink">{categories.length}</dd>
              </div>
              <div className="rounded-xl border border-line bg-white p-4">
                <dt className="text-[12px] text-muted">Subcategorías</dt>
                <dd className="mt-1 text-xl font-semibold text-ink">
                  {categories.reduce((total, category) => total + category.subcategories.length, 0)}
                </dd>
              </div>
              <div className="rounded-xl border border-line bg-white p-4">
                <dt className="text-[12px] text-muted">Cobertura</dt>
                <dd className="mt-1 text-[15px] font-semibold leading-tight text-ink">
                  Todo el país
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name="zap" size={20} />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-ink">Nuestra misión</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Suministrar soluciones tecnológicas, mobiliario, equipos y materiales que permitan a
                empresas, instituciones y hogares operar con mayor productividad y eficiencia,
                ofreciendo un servicio comercial cercano y confiable.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name="eye" size={20} />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-ink">Nuestra visión</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Ser reconocidos como un proveedor integral de referencia en República Dominicana,
                capaz de atender en un mismo lugar los requerimientos de equipamiento y suministro de
                nuestros clientes.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="canvas" className="border-y border-line">
        <Container>
          <SectionHeading
            eyebrow="Cultura"
            title="Nuestros valores"
            description="Los principios que orientan la relación con cada cliente."
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon name={value.icon} size={18} />
                </span>
                <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{value.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{value.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <SectionHeading
              eyebrow="Diferenciales"
              title="Por qué elegir Tri Office"
              description="Lo que buscamos resolverle a cada cliente empresarial."
              className="mb-0"
            />
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
              {reasons.map((reason, index) => (
                <li key={reason.title} className="flex gap-4 p-5">
                  <span className="text-[13px] font-semibold text-brand-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">{reason.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{reason.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="dark">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold sm:text-[30px]">Conversemos sobre tu operación</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-100/85">
                Escríbenos o llámanos al {site.phone}. Un asesor revisa contigo lo que necesita tu
                empresa y prepara una propuesta.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/contacto" variant="accent" size="lg">
                Contactar
              </LinkButton>
              <LinkButton
                href="/empresas"
                size="lg"
                className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                Soluciones para empresas
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

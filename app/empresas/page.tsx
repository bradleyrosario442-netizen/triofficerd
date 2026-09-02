import type { Metadata } from "next";
import { SolutionsGrid } from "@/components/home/solutions";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { site } from "@/lib/data/site";
import { telHref, whatsappGeneral } from "@/lib/utils/whatsapp";

export const metadata: Metadata = {
  title: "Soluciones para empresas",
  description:
    "Tri Office abastece a empresas e instituciones con tecnología, impresión, equipos de oficina y mobiliario mediante cotizaciones y pedidos por volumen.",
  alternates: { canonical: "/empresas" },
};

const process: { icon: IconGlyph; title: string; text: string }[] = [
  {
    icon: "file-text",
    title: "Levantamiento de requerimientos",
    text: "Recibimos tu listado o lo armamos contigo a partir de las necesidades por área.",
  },
  {
    icon: "quote",
    title: "Cotización consolidada",
    text: "Una sola propuesta con precios, disponibilidad y tiempos de entrega.",
  },
  {
    icon: "check-circle",
    title: "Confirmación y facturación",
    text: "Emitimos el comprobante fiscal correspondiente según el RNC registrado.",
  },
  {
    icon: "truck",
    title: "Entrega coordinada",
    text: "Programamos el despacho según la operación y los accesos del cliente.",
  },
];

const audiences = [
  "Empresas privadas y corporaciones",
  "Instituciones públicas y ONG",
  "Centros educativos y universidades",
  "Clínicas, laboratorios y consultorios",
  "Comercios, colmados y ferreterías",
  "Oficinas profesionales y coworkings",
];

export default function EmpresasPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-brand-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.5) 1px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to bottom right, black, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 70%)",
          }}
        />
        <Container className="relative py-12 sm:py-16">
          <div className="text-brand-100/90">
            <Breadcrumbs items={[{ label: "Empresas" }]} />
          </div>
          <div className="mt-5 max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-200">
              Tri Office para organizaciones
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-[42px]">
              Abastecemos tu empresa. Simplificamos tu operación.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-brand-100/85">
              Tri Office puede convertirse en el proveedor que atiende los requerimientos de toda la
              organización: desde el equipamiento tecnológico y el mobiliario hasta la reposición
              mensual de consumibles de impresión y accesorios de cómputo.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={whatsappGeneral} variant="accent" size="lg" target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={18} />
                Hablar con un asesor
              </LinkButton>
              <LinkButton
                href="/cotizacion"
                size="lg"
                className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
              >
                Solicitar cotización
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Líneas de suministro"
            title="Qué podemos abastecer"
            description="Un mismo proveedor para las categorías que sostienen la operación diaria."
          />
          <SolutionsGrid />
        </Container>
      </Section>

      <Section tone="canvas" className="border-y border-line">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <SectionHeading
                eyebrow="Cómo trabajamos"
                title="Un proceso claro, de la solicitud a la entrega"
                className="mb-6"
              />
              <p className="text-[14.5px] leading-relaxed text-muted">
                El objetivo es reducir el trabajo administrativo de compras: menos proveedores, menos
                órdenes por gestionar y una sola coordinación de entrega.
              </p>
              <div className="mt-6 rounded-xl border border-line bg-white p-5">
                <h3 className="text-[14px] font-semibold text-ink">¿Quiénes nos compran?</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {audiences.map((audience) => (
                    <li key={audience} className="flex items-start gap-2 text-[13.5px] text-muted">
                      <Icon name="check" size={15} className="mt-0.5 shrink-0 text-brand-600" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ol className="space-y-3">
              {process.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-xl border border-line bg-white p-5"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name={step.icon} size={19} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="overflow-hidden rounded-2xl border border-line">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-10">
                <h2 className="text-2xl font-semibold leading-tight text-ink">
                  ¿Listo para consolidar las compras de tu empresa?
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                  Escríbenos con tu listado de requerimientos o arma la lista directamente en la
                  plataforma. Un asesor te acompaña durante todo el proceso.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <LinkButton href="/cotizacion" size="lg">
                    <Icon name="quote" size={17} />
                    Armar mi cotización
                  </LinkButton>
                  <LinkButton href="/contacto" variant="outline" size="lg">
                    Ir a contacto
                  </LinkButton>
                </div>
              </div>

              <div className="border-t border-line bg-canvas p-8 sm:p-10 lg:border-l lg:border-t-0">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Contacto directo
                </h3>
                <ul className="mt-4 space-y-4 text-[14px]">
                  <li>
                    <a href={telHref} className="flex items-center gap-3 text-ink hover:text-brand-700">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-card">
                        <Icon name="phone" size={18} />
                      </span>
                      <span>
                        <span className="block text-[12px] text-muted">Teléfono</span>
                        <span className="font-medium">{site.phone}</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${site.email}`}
                      className="flex items-center gap-3 text-ink hover:text-brand-700"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-card">
                        <Icon name="mail" size={18} />
                      </span>
                      <span>
                        <span className="block text-[12px] text-muted">Correo</span>
                        <span className="font-medium">{site.email}</span>
                      </span>
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-ink">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-card">
                      <Icon name="clock" size={18} />
                    </span>
                    <span>
                      <span className="block text-[12px] text-muted">Horario</span>
                      {site.hours.map((entry) => (
                        <span key={entry.days} className="block font-medium">
                          {entry.days}: {entry.time}
                        </span>
                      ))}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

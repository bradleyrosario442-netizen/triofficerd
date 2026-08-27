import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/quote-builder";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Solicitar cotización empresarial",
  description:
    "Arma una lista con los productos que necesita tu empresa y recibe una cotización consolidada con precios por volumen.",
  alternates: { canonical: "/cotizacion" },
};

const steps = [
  { icon: "box" as const, title: "Agrega productos", text: "Desde el catálogo, con el botón de cotización." },
  { icon: "list" as const, title: "Define cantidades", text: "Indica unidades y notas por artículo." },
  { icon: "send" as const, title: "Envía la solicitud", text: "Completa los datos de tu empresa." },
  { icon: "headset" as const, title: "Recibe la propuesta", text: "Un asesor responde con precios y plazos." },
];

export default function CotizacionPage() {
  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Cotización empresarial" }]} />
          <div className="mt-4 max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-600">
              Compras empresariales
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
              Solicitar cotización empresarial
            </h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
              La cotización es distinta al carrito de compra: aquí no hay pago en línea. Envías tu
              listado de requerimientos y un asesor responde con precios por volumen, disponibilidad
              y condiciones de entrega.
            </p>
          </div>

          <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-xl border border-line bg-white p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon name={step.icon} size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold text-ink">
                    {index + 1}. {step.title}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                    {step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <QuoteBuilder />
      </Container>
    </>
  );
}

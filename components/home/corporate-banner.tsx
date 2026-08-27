import { LinkButton } from "@/components/ui/button";
import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

const points: { icon: IconGlyph; label: string }[] = [
  { icon: "file-text", label: "Una sola cotización" },
  { icon: "refresh", label: "Reposición programada" },
  { icon: "truck", label: "Entrega coordinada" },
];

/** Franja B2B: propuesta directa, sin párrafos largos. */
export function CorporateBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1">
        <span className="flex-1 bg-accent-500" />
        <span className="flex-1 bg-fresh-500" />
      </div>

      <Container className="relative py-11 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-xl text-2xl font-semibold leading-tight sm:text-[30px]">
              ¿Compras para tu empresa? Cotiza todo de una vez.
            </h2>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
              {points.map((point) => (
                <li key={point.label} className="inline-flex items-center gap-2 text-[14px] text-brand-100">
                  <Icon name={point.icon} size={16} className="text-fresh-500" />
                  {point.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <LinkButton href="/cotizacion" variant="accent" size="lg">
              Solicitar cotización
              <Icon name="arrow-right" size={17} />
            </LinkButton>
            <LinkButton
              href="/empresas"
              size="lg"
              className="border border-white/25 bg-white/10 text-white hover:bg-white/20"
            >
              Ver soluciones
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}

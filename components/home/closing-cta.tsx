import { PillLink } from "@/components/ui/pill-button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/data/site";
import { telHref } from "@/lib/utils/whatsapp";

/** Cierre: promesa comercial a la izquierda, tarjeta de acción a la derecha. */
export function ClosingCta() {
  return (
    <Container className="py-4 pb-14">
      <div className="relative overflow-hidden rounded-3xl bg-brand-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.45) 1.5px, transparent 0)",
            backgroundSize: "16px 16px",
            maskImage: "linear-gradient(to right, black, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          }}
        />

        <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <Icon name="quote" size={38} className="text-fresh-500" />
            <p className="mt-5 max-w-lg font-display text-[26px] font-semibold leading-[1.25] tracking-[-0.01em] sm:text-[32px]">
              Un solo proveedor para la tecnología, la impresión y el equipamiento que la
              operación necesita cada mes.
            </p>
            <p className="mt-5 text-[13px] uppercase tracking-[0.14em] text-white/50">
              Tri Office · República Dominicana
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur-[2px]">
            <h2 className="font-display text-[22px] font-bold uppercase leading-tight tracking-[-0.01em]">
              ¿Listo para abastecer
              <br />
              tu empresa?
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/65">
              Envíanos tu listado de requerimientos y un asesor prepara la cotización con
              precios, disponibilidad y tiempo de entrega.
            </p>

            <PillLink href="/cotizacion" className="mt-6">
              Solicitar cotización
            </PillLink>

            <a
              href={telHref}
              className="mt-5 flex items-center gap-2 text-[13px] text-white/70 transition-colors hover:text-white"
            >
              <Icon name="phone" size={15} className="text-fresh-500" />
              {site.phone}
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}

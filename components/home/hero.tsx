import Image from "next/image";
import Link from "next/link";
import { PillLink } from "@/components/ui/pill-button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import catalogImages from "@/data/product-images.json";
import type { Product } from "@/lib/types";

/** Posición, tamaño y ritmo de cada pieza del collage. */
const layout = [
  { className: "left-[4%] top-[6%] w-[58%] z-20", delay: "0s" },
  { className: "right-[2%] top-0 w-[34%] z-10", delay: "1.4s" },
  { className: "right-[8%] bottom-[4%] w-[32%] z-30", delay: "2.6s" },
  { className: "left-[2%] top-[52%] w-[19%] z-30", delay: "3.6s" },
];

/** Ilustraciones de respaldo mientras no haya fotografías cargadas. */
const fallback = [
  "/img/hero/laptop.svg",
  "/img/hero/exec_chair.svg",
  "/img/hero/printer.svg",
  "/img/hero/toner.svg",
];

/**
 * Las piezas salen de public/img/hero/fotos si hay archivos ahí; si no, de las
 * ilustraciones. Se usan tantas como imágenes existan, hasta cuatro.
 */
const heroPhotos = (catalogImages as { hero: string[] }).hero;
const sources = heroPhotos.length > 0 ? heroPhotos.slice(0, 4) : fallback;
const collage = sources.map((src, index) => ({ src, ...layout[index] }));

export function Hero({ deal, total }: { deal?: Product; total: number }) {
  return (
    <section className="relative overflow-hidden bg-mist">
      {/* Círculo de marca y trama de puntos, como fondo del collage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[6%] top-10 hidden h-[520px] w-[520px] rounded-full bg-brand-100/70 blur-[2px] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[3%] top-[42%] hidden h-32 w-40 lg:block"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgb(26 43 196 / 0.35) 1.5px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      />

      <Container className="relative py-12 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-brand-700">
              <Icon name="zap" size={15} className="text-fresh-600" />
              Proveedor integral
            </p>

            <h1 className="mt-4 font-display text-[44px] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[68px]">
              Todo para
              <span className="block text-brand-600">tu oficina</span>
              en un pedido
            </h1>

            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted">
              Tecnología, impresión, mobiliario y equipos. Cotiza en un mensaje.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PillLink href="/tienda">Explorar catálogo</PillLink>
              <Link
                href="/cotizacion"
                className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink underline decoration-fresh-500 decoration-2 underline-offset-[6px] hover:text-brand-700"
              >
                Cotizar por volumen
              </Link>
            </div>

            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink shadow-card">
              <Icon name="box" size={15} className="text-fresh-600" />
              {total.toLocaleString("es-DO")} productos en catálogo
            </p>
          </div>

          {/* Collage de producto */}
          <div className="relative">
            <div className="relative mx-auto aspect-[4/3.4] w-full max-w-xl">
              {collage.map((piece) => (
                <div
                  key={piece.src}
                  className={`absolute animate-float drop-shadow-[0_18px_28px_rgba(15,23,42,0.14)] ${piece.className}`}
                  style={{ animationDelay: piece.delay }}
                >
                  <Image
                    src={piece.src}
                    alt=""
                    width={520}
                    height={520}
                    priority
                    className="h-auto w-full"
                  />
                </div>
              ))}
            </div>

            {/* Oferta viva sobre el collage */}
            {deal ? (
              <Link
                href={`/producto/${deal.slug}`}
                className="group absolute -bottom-2 left-0 z-40 hidden items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 pr-5 shadow-lift backdrop-blur transition-transform hover:-translate-y-0.5 sm:flex"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-canvas">
                  <Image src={deal.images[0]} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span>
                  <span className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-600">
                    Del catálogo
                  </span>
                  <span className="mt-0.5 block max-w-[15rem] truncate text-[13px] font-semibold text-ink">
                    {deal.name}
                  </span>
                </span>
                <Icon
                  name="arrow-right"
                  size={16}
                  className="ml-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

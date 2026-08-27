import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

const pillars: { icon: IconGlyph; title: string; text: string }[] = [
  {
    icon: "box",
    title: "Catálogo completo",
    text: "Siete líneas que cubren toda la operación, de la laptop al galón de cloro.",
  },
  {
    icon: "quote",
    title: "Cotización por volumen",
    text: "Arma la lista y recibe una propuesta consolidada con precios y plazos.",
  },
  {
    icon: "truck",
    title: "Entrega coordinada",
    text: "Despacho programado a Santo Domingo y al interior del país.",
  },
  {
    icon: "headset",
    title: "Asesor asignado",
    text: "Una persona que da seguimiento desde la solicitud hasta la entrega.",
  },
];

/** Banda oscura de pilares: cuatro columnas separadas por filete. */
export function Pillars() {
  return (
    <Container className="pb-4">
      <div className="rounded-3xl bg-ink px-6 py-9 text-white sm:px-10 lg:px-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fresh-500">
          Construido para tu operación
        </p>

        <ul className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className={
                index > 0
                  ? "lg:border-l lg:border-white/12 lg:pl-8"
                  : "lg:pr-8"
              }
            >
              <Icon name={pillar.icon} size={26} className="text-fresh-500" />
              <h3 className="mt-4 text-[14px] font-bold uppercase leading-tight tracking-[0.04em]">
                {pillar.title}
              </h3>
              <p className="mt-2.5 max-w-[15rem] text-[13px] leading-relaxed text-white/55">
                {pillar.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

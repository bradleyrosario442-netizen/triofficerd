import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

function statsFor(total: number, brands: number): { icon: IconGlyph; value: string; label: string }[] {
  return [
    { icon: "box", value: total.toLocaleString("es-DO"), label: "Productos en catálogo" },
    { icon: "award", value: String(brands), label: "Marcas representadas" },
    { icon: "grid", value: "5", label: "Líneas de producto" },
    { icon: "headset", value: "B2B", label: "Cotización empresarial" },
  ];
}

/** Franja de cifras sobre degradado de marca. */
export function StatsBand({ total, brands }: { total: number; brands: number }) {
  const stats = statsFor(total, brands);
  return (
    <Container className="py-4">
      <div className="overflow-hidden rounded-3xl bg-linear-to-r from-brand-800 via-brand-700 to-brand-600">
        <ul className="grid grid-cols-2 gap-y-7 px-6 py-8 sm:px-10 lg:grid-cols-4 lg:gap-0">
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className={`flex items-center gap-3.5 ${
                index > 0 ? "lg:border-l lg:border-white/15 lg:pl-8" : ""
              }`}
            >
              <Icon name={stat.icon} size={24} className="shrink-0 text-white/70" />
              <span>
                <span className="block text-[22px] font-bold leading-none text-white">
                  {stat.value}
                </span>
                <span className="mt-1.5 block text-[12.5px] text-white/65">{stat.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

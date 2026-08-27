import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

const stats: { icon: IconGlyph; value: string; label: string }[] = [
  { icon: "box", value: "7", label: "Líneas de producto" },
  { icon: "grid", value: "95", label: "Subcategorías" },
  { icon: "building", value: "B2B", label: "Cotización empresarial" },
  { icon: "headset", value: "Lun–Sáb", label: "Atención comercial" },
];

/** Franja de cifras sobre degradado de marca. */
export function StatsBand() {
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

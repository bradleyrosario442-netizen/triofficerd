import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

const items: { icon: IconGlyph; label: string }[] = [
  { icon: "truck", label: "Envío a todo el país" },
  { icon: "quote", label: "Cotización por volumen" },
  { icon: "shield", label: "Garantía del fabricante" },
  { icon: "headset", label: "Asesor asignado" },
];

/** Banda de confianza: cuatro señales, sin párrafos. */
export function ValueStrip() {
  return (
    <div className="border-y border-line bg-canvas">
      <Container>
        <ul className="grid grid-cols-2 gap-y-3 py-4 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5">
              <Icon name={item.icon} size={17} className="shrink-0 text-brand-600" />
              <span className="text-[13.5px] font-medium text-ink">{item.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

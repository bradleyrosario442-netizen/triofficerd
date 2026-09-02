import Link from "next/link";
import { Icon, type IconGlyph } from "@/components/ui/icon";

export interface Solution {
  icon: IconGlyph;
  title: string;
  text: string;
  href: string;
}

export const solutions: Solution[] = [
  {
    icon: "cpu",
    title: "Tecnología empresarial",
    text: "Laptops, desktops, redes y comunicación para equipar puestos de trabajo.",
    href: "/categoria/tecnologia",
  },
  {
    icon: "shield",
    title: "Seguridad electrónica",
    text: "Cámaras, grabadores NVR y accesorios de videovigilancia.",
    href: "/categoria/tecnologia/camaras-de-seguridad",
  },
  {
    icon: "printer",
    title: "Soluciones de impresión",
    text: "Equipos, tóner y consumibles según el volumen de impresión.",
    href: "/categoria/impresion",
  },
  {
    icon: "sofa",
    title: "Mobiliario corporativo",
    text: "Escritorios, sillas y almacenamiento para espacios de trabajo.",
    href: "/categoria/mobiliario",
  },
  {
    icon: "clipboard",
    title: "Equipamiento de oficina",
    text: "Cajas registradoras, climatización y equipos de apoyo administrativo.",
    href: "/categoria/equipos-de-oficina",
  },
  {
    icon: "refresh",
    title: "Compras recurrentes",
    text: "Programa la reposición periódica de los insumos de mayor rotación.",
    href: "/empresas",
  },
  {
    icon: "truck",
    title: "Pedidos por volumen",
    text: "Requerimientos de alto volumen atendidos mediante cotización.",
    href: "/cotizacion",
  },
];

export function SolutionsGrid({ items = solutions }: { items?: Solution[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((solution) => (
        <Link
          key={solution.title}
          href={solution.href}
          className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-all duration-200 hover:border-brand-200 hover:shadow-lift"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
            <Icon name={solution.icon} size={19} />
          </span>
          <h3 className="mt-4 text-[15px] font-semibold text-ink">{solution.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{solution.text}</p>
          <span className="mt-auto pt-4 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700">
            Ver más
            <Icon
              name="chevron-right"
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      ))}
    </div>
  );
}

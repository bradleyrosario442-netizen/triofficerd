"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconGlyph } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

const links: { href: string; icon: IconGlyph; label: string }[] = [
  { href: "/", icon: "sparkles", label: "Inicio" },
  { href: "/tienda", icon: "grid", label: "Catálogo" },
  { href: "/cotizacion", icon: "quote", label: "Cotización" },
  { href: "/empresas", icon: "building", label: "Empresas" },
  { href: "/contacto", icon: "headset", label: "Contacto" },
];

/** Dock flotante de acceso rápido; solo en pantallas anchas. */
export function SideDock() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Accesos rápidos"
      className="pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-1 rounded-full border border-line bg-white/90 p-2 shadow-lift backdrop-blur">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  active ? "bg-ink text-white" : "text-muted hover:bg-brand-50 hover:text-brand-700",
                )}
              >
                <Icon name={link.icon} size={19} />
                <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[12px] font-medium text-white group-hover:block">
                  {link.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

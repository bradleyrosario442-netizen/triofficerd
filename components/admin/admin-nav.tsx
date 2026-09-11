"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/format";

const links = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/productos", label: "Productos", exact: false },
  { href: "/admin/fotos", label: "Subir fotos", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel" className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-[13.5px] font-medium transition-colors",
              active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-canvas hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { categories } from "@/lib/data/categories";
import { site } from "@/lib/data/site";
import { useUI } from "@/lib/store/ui-context";
import { cn } from "@/lib/utils/format";
import { telHref, whatsappGeneral } from "@/lib/utils/whatsapp";

const staticLinks = [
  { href: "/tienda", label: "Tienda", icon: "box" as const },
  { href: "/empresas", label: "Soluciones para empresas", icon: "building" as const },
  { href: "/cotizacion", label: "Cotización empresarial", icon: "quote" as const },
  { href: "/marcas", label: "Marcas", icon: "award" as const },
  { href: "/nosotros", label: "Nosotros", icon: "users" as const },
  { href: "/contacto", label: "Contacto", icon: "headset" as const },
];

/** Navegación móvil: el mega menú se convierte en acordeones por categoría. */
export function MobileNav() {
  const { isOpen, closePanel } = useUI();
  const open = isOpen("nav");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={closePanel}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45 animate-fade-in"
      />

      <div className="relative flex h-full w-[86%] max-w-sm flex-col bg-white shadow-pop">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            type="button"
            onClick={closePanel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-slate-100"
            aria-label="Cerrar menú"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin">
          <div className="px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Categorías
            </p>
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
              {categories.map((category) => {
                const isExpanded = expanded === category.slug;
                return (
                  <li key={category.slug}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : category.slug)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <Icon name={category.icon} size={16} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14px] font-medium text-ink">{category.name}</span>
                        <span className="block text-[12px] text-muted">{category.tagline}</span>
                      </span>
                      <Icon
                        name="chevron-down"
                        size={16}
                        className={cn("shrink-0 text-muted transition-transform", isExpanded && "rotate-180")}
                      />
                    </button>

                    {isExpanded ? (
                      <div className="bg-canvas px-3.5 pb-3 pt-1">
                        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {category.subcategories.slice(0, 12).map((subcategory) => (
                            <li key={subcategory.slug}>
                              <Link
                                href={`/categoria/${category.slug}/${subcategory.slug}`}
                                onClick={closePanel}
                                className="block truncate py-1 text-[13px] text-muted transition-colors hover:text-brand-700"
                              >
                                {subcategory.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={`/categoria/${category.slug}`}
                          onClick={closePanel}
                          className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700"
                        >
                          Ver toda la categoría
                          <Icon name="chevron-right" size={13} />
                        </Link>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="px-4 pb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Tri Office
            </p>
            <ul className="overflow-hidden rounded-lg border border-line">
              {staticLinks.map((link) => (
                <li key={link.href} className="border-b border-line last:border-b-0">
                  <Link
                    href={link.href}
                    onClick={closePanel}
                    className="flex items-center gap-3 px-3.5 py-3 text-[14px] font-medium text-ink transition-colors hover:bg-slate-50"
                  >
                    <Icon name={link.icon} size={17} className="text-brand-700" />
                    {link.label}
                    <Icon name="chevron-right" size={15} className="ml-auto text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t border-line bg-canvas p-4">
          <a
            href={whatsappGeneral}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#128C7E] text-sm font-medium text-white"
          >
            <Icon name="whatsapp" size={18} />
            Escribir por WhatsApp
          </a>
          <a
            href={telHref}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-medium text-ink"
          >
            <Icon name="phone" size={17} />
            {site.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

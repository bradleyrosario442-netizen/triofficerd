"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchIconButton, SearchTrigger } from "@/components/search/search-trigger";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { site } from "@/lib/data/site";
import { useQuote } from "@/lib/store/quote-context";
import { useUI } from "@/lib/store/ui-context";
import { cn } from "@/lib/utils/format";
import { telHref } from "@/lib/utils/whatsapp";

const navLinks = [
  { href: "/categoria/tecnologia", label: "Tecnología" },
  { href: "/categoria/impresion", label: "Impresión" },
  { href: "/categoria/equipos-de-oficina", label: "Equipos" },
  { href: "/categoria/mobiliario", label: "Mobiliario" },
  { href: "/categoria/escolares", label: "Escolares" },
  { href: "/empresas", label: "Empresas" },
  { href: "/nosotros", label: "Nosotros" },
];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * Barra superior.
 *
 * El catálogo es de cotización, así que no hay carrito: la acción principal es
 * la lista de cotización, que sí acumula productos.
 */
export function Header() {
  const pathname = usePathname();
  const { openPanel } = useUI();
  const { count: quoteCount, hydrated: quoteReady } = useQuote();

  // Atajo de teclado del buscador global.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPanel("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPanel]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Barra institucional */}
      <div className="hidden bg-brand-900 text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[12.5px]">
          <p className="inline-flex items-center gap-2 text-brand-100/90">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-fresh-500" />
            Cotizaciones para empresas e instituciones
          </p>
          <div className="flex items-center gap-5">
            <a
              href={telHref}
              className="inline-flex items-center gap-1.5 text-brand-100 transition-colors hover:text-white"
            >
              <Icon name="phone" size={14} />
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-1.5 text-brand-100 transition-colors hover:text-white"
            >
              <Icon name="mail" size={14} />
              {site.email}
            </a>
            <Link href="/cotizacion" className="inline-flex items-center gap-1.5 font-medium text-white">
              <Icon name="quote" size={14} />
              Solicitar cotización
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
          <button
            type="button"
            onClick={() => openPanel("nav")}
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Icon name="menu" size={22} />
          </button>

          <Logo className="shrink-0" />

          <div className="ml-auto hidden max-w-xl flex-1 lg:ml-6 lg:block">
            <SearchTrigger />
          </div>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-0 lg:gap-1">
            <SearchIconButton className="lg:hidden" />

            <Link
              href="/cuenta"
              aria-label="Mi cuenta"
              className="hidden h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-slate-100 sm:inline-flex"
            >
              <Icon name="user" size={20} />
              <span className="hidden xl:inline">Cuenta</span>
            </Link>

            <Link
              href="/cotizacion"
              aria-label={`Mi cotización${quoteReady && quoteCount ? `, ${quoteCount} artículos` : ""}`}
              className="relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-slate-100"
            >
              <span className="relative">
                <Icon name="quote" size={20} />
                <CountBadge count={quoteReady ? quoteCount : 0} />
              </span>
              <span className="hidden xl:inline">Cotización</span>
            </Link>
          </div>
        </div>

        {/* Navegación principal (desktop) */}
        <nav className="relative hidden border-t border-line lg:block" aria-label="Navegación principal">
          <div className="container-page flex items-center gap-7">
            <MegaMenu />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 px-1 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "border-brand-700 text-brand-800"
                    : "border-transparent text-ink hover:text-brand-700",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tienda"
              className="ml-auto inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              Ver catálogo
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}

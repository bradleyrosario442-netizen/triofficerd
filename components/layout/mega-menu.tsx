"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { categories } from "@/lib/data/categories";
import { menuSubcategories } from "@/lib/data/catalog-meta";
import { cn } from "@/lib/utils/format";

/**
 * Mega menú corporativo: muestra las divisiones principales en columnas,
 * no el catálogo completo.
 */
export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const columns = categories.filter((category) => category.highlighted).slice(0, 5);

  return (
    <div
      ref={wrapper}
      className="static"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 border-b-2 px-1 text-sm font-medium transition-colors",
          open ? "border-brand-700 text-brand-800" : "border-transparent text-ink hover:text-brand-700",
        )}
      >
        Productos
        <Icon
          name="chevron-down"
          size={15}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <>
          <div
            className="absolute inset-x-0 top-full z-40 border-b border-line bg-white shadow-pop animate-slide-down"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_260px]">
              <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {columns.map((category) => (
                  <div key={category.slug}>
                    <Link
                      href={`/categoria/${category.slug}`}
                      className="group mb-3 flex items-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <Icon name={category.icon} size={15} />
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors group-hover:text-brand-700">
                        {category.name}
                      </span>
                    </Link>
                    <ul className="space-y-1.5">
                      {menuSubcategories(category.slug, 7).map((subcategory) => (
                        <li key={subcategory.slug}>
                          <Link
                            href={`/categoria/${category.slug}/${subcategory.slug}`}
                            onClick={() => setOpen(false)}
                            className="block text-[13.5px] text-muted transition-colors hover:text-brand-700"
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/categoria/${category.slug}`}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:text-brand-900"
                        >
                          Ver todo
                          <Icon name="chevron-right" size={13} />
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              <aside className="hidden rounded-xl border border-line bg-canvas p-5 lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
                  Compras empresariales
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-snug text-ink">
                  ¿Necesitas equipar varias áreas a la vez?
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Arma una lista con todo lo que requiere tu empresa y recibe una cotización consolidada.
                </p>
                <Link
                  href="/cotizacion"
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 text-[13px] font-medium text-white transition-colors hover:bg-brand-800"
                >
                  Solicitar cotización
                  <Icon name="arrow-right" size={15} />
                </Link>
              </aside>
            </div>

            <div className="border-t border-line bg-canvas">
              <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
                <p className="text-[13px] text-muted">
                  Más de {categories.reduce((total, c) => total + c.subcategories.length, 0)} subcategorías
                  disponibles en el catálogo.
                </p>
                <Link
                  href="/tienda"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:text-brand-900"
                >
                  Ver todos los productos
                  <Icon name="arrow-right" size={15} />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

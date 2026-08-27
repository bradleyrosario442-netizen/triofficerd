"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiltersPanel } from "@/components/shop/filters-panel";
import { Icon } from "@/components/ui/icon";
import { buildQuery, sortOptions } from "@/lib/services/shop-params";
import type { Brand, Category } from "@/lib/types";
import { cn } from "@/lib/utils/format";

interface ShopToolbarProps {
  total: number;
  showing: number;
  view: "grid" | "list";
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
  lockedCategory?: string;
  activeFilterCount: number;
}

export function ShopToolbar({
  total,
  showing,
  view,
  categories,
  brands,
  priceRange,
  lockedCategory,
  activeFilterCount,
}: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Bloquea el scroll del documento mientras el panel de filtros está abierto.
  useEffect(() => {
    if (!drawerOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [drawerOpen]);

  const currentSort = searchParams.get("orden") ?? "destacados";

  const update = (updates: Record<string, string | string[] | null>) => {
    router.push(`${pathname}${buildQuery(searchParams, updates)}`, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="text-[13.5px] text-muted">
          Mostrando <span className="font-medium text-ink">{showing}</span> de{" "}
          <span className="font-medium text-ink">{total}</span> productos
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3.5 text-[13px] font-medium text-ink transition-colors hover:border-brand-300 lg:hidden"
          >
            <Icon name="sliders" size={16} />
            Filtros
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <label className="sr-only" htmlFor="orden">
            Ordenar por
          </label>
          <select
            id="orden"
            value={currentSort}
            onChange={(event) => update({ orden: event.target.value })}
            className="h-10 rounded-lg border border-line bg-white pl-3 pr-8 text-[13px] text-ink transition-colors hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            style={{
              appearance: "none",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.6rem center",
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.param} value={option.param}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="hidden items-center rounded-lg border border-line p-0.5 sm:flex">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ vista: mode === "list" ? "lista" : null })}
                aria-label={mode === "grid" ? "Vista en cuadrícula" : "Vista en lista"}
                aria-pressed={view === mode}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  view === mode ? "bg-brand-50 text-brand-700" : "text-muted hover:text-ink",
                )}
              >
                <Icon name={mode === "grid" ? "grid" : "list"} size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/45 animate-fade-in"
          />
          <div className="absolute bottom-0 left-0 right-0 flex max-h-[86vh] flex-col rounded-t-2xl bg-white shadow-pop">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <h2 className="text-[15px] font-semibold text-ink">Filtros</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink"
                aria-label="Cerrar"
              >
                <Icon name="close" size={19} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 scroll-thin">
              <FiltersPanel
                categories={categories}
                brands={brands}
                priceRange={priceRange}
                lockedCategory={lockedCategory}
              />
            </div>
            <div className="shrink-0 border-t border-line p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-11 w-full rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-800"
              >
                Ver {total} productos
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

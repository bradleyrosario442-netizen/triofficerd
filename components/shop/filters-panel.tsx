"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { buildQuery } from "@/lib/services/shop-params";
import type { Brand, Category } from "@/lib/types";
import { cn } from "@/lib/utils/format";

interface FiltersPanelProps {
  categories: Category[];
  brands: Brand[];
  /** Categoría fija: en /categoria/[slug] el filtro de categoría no se muestra. */
  lockedCategory?: string;
}

function Group({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">{title}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={cn("text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

export function FiltersPanel({ categories, brands, lockedCategory }: FiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [brandQuery, setBrandQuery] = useState("");

  const selectedCategory = lockedCategory ?? searchParams.get("categoria") ?? "";
  const selectedSubcategory = searchParams.get("subcategoria") ?? "";
  const selectedBrands = (searchParams.get("marca") ?? "").split(",").filter(Boolean);

  // El panel móvil no se cierra al filtrar: se suelen combinar varios criterios.
  const apply = (updates: Record<string, string | string[] | null>) => {
    router.push(`${pathname}${buildQuery(searchParams, updates)}`, { scroll: false });
  };

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  // Con más de cien marcas, el listado necesita su propio buscador.
  const visibleBrands = useMemo(() => {
    const needle = brandQuery.trim().toLowerCase();
    const list = needle
      ? brands.filter((brand) => brand.name.toLowerCase().includes(needle))
      : brands;
    return list.slice(0, 60);
  }, [brands, brandQuery]);

  return (
    <div className="text-ink">
      {!lockedCategory ? (
        <Group title="Categoría">
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => apply({ categoria: null, subcategoria: null })}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-[13.5px] transition-colors",
                  !selectedCategory ? "bg-brand-50 font-medium text-brand-800" : "hover:bg-slate-50",
                )}
              >
                Todas las categorías
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  type="button"
                  onClick={() => apply({ categoria: category.slug, subcategoria: null })}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-[13.5px] transition-colors",
                    selectedCategory === category.slug
                      ? "bg-brand-50 font-medium text-brand-800"
                      : "hover:bg-slate-50",
                  )}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </Group>
      ) : null}

      {activeCategory ? (
        <Group title="Subcategoría">
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1 scroll-thin">
            <button
              type="button"
              onClick={() => apply({ subcategoria: null })}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-[13.5px] transition-colors",
                !selectedSubcategory ? "bg-brand-50 font-medium text-brand-800" : "hover:bg-slate-50",
              )}
            >
              Todas
            </button>
            {activeCategory.subcategories.map((subcategory) => (
              <button
                key={subcategory.slug}
                type="button"
                onClick={() => apply({ subcategoria: subcategory.slug })}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-[13.5px] transition-colors",
                  selectedSubcategory === subcategory.slug
                    ? "bg-brand-50 font-medium text-brand-800"
                    : "hover:bg-slate-50",
                )}
              >
                {subcategory.name}
              </button>
            ))}
          </div>
        </Group>
      ) : null}

      <Group title="Marca">
        <input
          type="search"
          value={brandQuery}
          onChange={(event) => setBrandQuery(event.target.value)}
          placeholder="Buscar marca…"
          aria-label="Buscar marca"
          className="mb-2 h-9 w-full rounded-lg border border-line px-2.5 text-[13px] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <div className="max-h-64 overflow-y-auto pr-1 scroll-thin">
          {visibleBrands.map((brand) => (
            <label
              key={brand.slug}
              className="flex cursor-pointer items-center gap-2.5 py-1 text-[13.5px] text-ink"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.slug)}
                onChange={() => apply({ marca: toggle(selectedBrands, brand.slug) })}
                className="h-4 w-4 shrink-0 rounded border-slate-300 accent-brand-700 focus:ring-brand-500"
              />
              <span className="flex-1 truncate">{brand.name}</span>
            </label>
          ))}
          {visibleBrands.length === 0 ? (
            <p className="py-2 text-[12.5px] text-muted">Sin coincidencias</p>
          ) : null}
        </div>
      </Group>

      <button
        type="button"
        onClick={() => {
          const keep = searchParams.get("q");
          router.push(`${pathname}${keep ? `?q=${encodeURIComponent(keep)}` : ""}`, { scroll: false });
        }}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-line text-[13px] font-medium text-muted transition-colors hover:border-red-200 hover:text-red-600"
      >
        <Icon name="refresh" size={15} />
        Limpiar filtros
      </button>
    </div>
  );
}

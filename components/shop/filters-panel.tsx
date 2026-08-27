"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { availabilityOptions, buildQuery, kindOptions } from "@/lib/services/shop-params";
import type { Brand, Category } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils/format";

interface FiltersPanelProps {
  categories: Category[];
  brands: Brand[];
  priceRange: { min: number; max: number };
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

function CheckboxRow({
  checked,
  label,
  onChange,
  count,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[13.5px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-700 accent-brand-700 focus:ring-brand-500"
      />
      <span className="flex-1 truncate">{label}</span>
      {typeof count === "number" ? <span className="text-[12px] text-muted">{count}</span> : null}
    </label>
  );
}

export function FiltersPanel({
  categories,
  brands,
  priceRange,
  lockedCategory,
}: FiltersPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = lockedCategory ?? searchParams.get("categoria") ?? "";
  const selectedSubcategory = searchParams.get("subcategoria") ?? "";
  const selectedBrands = (searchParams.get("marca") ?? "").split(",").filter(Boolean);
  const selectedAvailability = (searchParams.get("disponibilidad") ?? "").split(",").filter(Boolean);
  const selectedKinds = (searchParams.get("tipo") ?? "").split(",").filter(Boolean);
  const onSale = searchParams.get("oferta") === "1";

  const [min, setMin] = useState(searchParams.get("min") ?? "");
  const [max, setMax] = useState(searchParams.get("max") ?? "");

  useEffect(() => {
    setMin(searchParams.get("min") ?? "");
    setMax(searchParams.get("max") ?? "");
  }, [searchParams]);

  // El panel móvil permanece abierto al filtrar: el usuario suele combinar
  // varios criterios y cierra con el botón "Ver N productos".
  const apply = (updates: Record<string, string | string[] | null>) => {
    router.push(`${pathname}${buildQuery(searchParams, updates)}`, { scroll: false });
  };

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  const activeCategory = categories.find((category) => category.slug === selectedCategory);

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
          <div className="max-h-64 space-y-1 overflow-y-auto pr-1 scroll-thin">
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
        <div className="max-h-64 overflow-y-auto pr-1 scroll-thin">
          {brands.map((brand) => (
            <CheckboxRow
              key={brand.slug}
              label={brand.name}
              checked={selectedBrands.includes(brand.slug)}
              onChange={() => apply({ marca: toggle(selectedBrands, brand.slug) })}
            />
          ))}
        </div>
      </Group>

      <Group title="Precio">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={min}
            onChange={(event) => setMin(event.target.value)}
            placeholder={String(priceRange.min)}
            aria-label="Precio mínimo"
            className="h-10 w-full rounded-lg border border-line px-2.5 text-[13px] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            value={max}
            onChange={(event) => setMax(event.target.value)}
            placeholder={String(priceRange.max)}
            aria-label="Precio máximo"
            className="h-10 w-full rounded-lg border border-line px-2.5 text-[13px] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <p className="mt-2 text-[12px] text-muted">
          Rango disponible: {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}
        </p>
        <button
          type="button"
          onClick={() => apply({ min: min || null, max: max || null })}
          className="mt-2.5 h-9 w-full rounded-lg border border-line text-[13px] font-medium transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          Aplicar precio
        </button>
      </Group>

      <Group title="Disponibilidad">
        {availabilityOptions.map((option) => (
          <CheckboxRow
            key={option.param}
            label={option.label}
            checked={selectedAvailability.includes(option.param)}
            onChange={() => apply({ disponibilidad: toggle(selectedAvailability, option.param) })}
          />
        ))}
      </Group>

      <Group title="Tipo de producto">
        {kindOptions.map((option) => (
          <CheckboxRow
            key={option.param}
            label={option.label}
            checked={selectedKinds.includes(option.param)}
            onChange={() => apply({ tipo: toggle(selectedKinds, option.param) })}
          />
        ))}
        <div className="mt-2 border-t border-line pt-2">
          <CheckboxRow
            label="Solo productos en oferta"
            checked={onSale}
            onChange={() => apply({ oferta: onSale ? null : "1" })}
          />
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

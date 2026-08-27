"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { buildQuery } from "@/lib/services/shop-params";

export interface ActiveFilterChip {
  key: string;
  label: string;
  /** Valor a remover cuando el parámetro admite varios. */
  value?: string;
}

export function ActiveFilters({ chips }: { chips: ActiveFilterChip[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (chips.length === 0) return null;

  const remove = (chip: ActiveFilterChip) => {
    if (chip.value) {
      const remaining = (searchParams.get(chip.key) ?? "")
        .split(",")
        .filter((entry) => entry && entry !== chip.value);
      router.push(`${pathname}${buildQuery(searchParams, { [chip.key]: remaining })}`, {
        scroll: false,
      });
      return;
    }
    router.push(`${pathname}${buildQuery(searchParams, { [chip.key]: null })}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <span className="text-[12.5px] font-medium text-muted">Filtros activos:</span>
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value ?? ""}`}
          type="button"
          onClick={() => remove(chip)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[12.5px] text-ink transition-colors hover:border-red-200 hover:text-red-600"
        >
          {chip.label}
          <Icon name="close" size={13} />
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          const query = searchParams.get("q");
          router.push(`${pathname}${query ? `?q=${encodeURIComponent(query)}` : ""}`, {
            scroll: false,
          });
        }}
        className="text-[12.5px] font-medium text-brand-700 underline-offset-2 hover:underline"
      >
        Limpiar todo
      </button>
    </div>
  );
}

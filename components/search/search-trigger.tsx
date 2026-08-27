"use client";

import { Icon } from "@/components/ui/icon";
import { useUI } from "@/lib/store/ui-context";
import { cn } from "@/lib/utils/format";

/** Campo simulado en el header: abre el buscador global. */
export function SearchTrigger({ className }: { className?: string }) {
  const { openPanel } = useUI();

  return (
    <button
      type="button"
      onClick={() => openPanel("search")}
      className={cn(
        "group flex h-11 w-full items-center gap-2.5 rounded-lg border border-line bg-canvas px-3.5 text-left transition-colors hover:border-brand-300 hover:bg-white",
        className,
      )}
      aria-label="Abrir el buscador"
    >
      <Icon name="search" size={18} className="text-muted transition-colors group-hover:text-brand-600" />
      <span className="flex-1 truncate text-sm text-slate-400">¿Qué estás buscando?</span>
      <kbd className="hidden shrink-0 rounded border border-line bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted lg:inline">
        Ctrl K
      </kbd>
    </button>
  );
}

export function SearchIconButton({ className }: { className?: string }) {
  const { openPanel } = useUI();
  return (
    <button
      type="button"
      onClick={() => openPanel("search")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-slate-100",
        className,
      )}
      aria-label="Buscar"
    >
      <Icon name="search" size={20} />
    </button>
  );
}

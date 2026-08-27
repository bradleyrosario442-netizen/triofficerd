"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 999,
  size = "md",
  label = "Cantidad",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const height = size === "sm" ? "h-9" : "h-11";
  const button = cn(
    "flex items-center justify-center text-muted transition-colors hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm" ? "w-8" : "w-10",
  );

  return (
    <div
      className={cn("inline-flex items-center overflow-hidden rounded-lg border border-line bg-white", height, className)}
    >
      <button
        type="button"
        className={cn(button, "h-full")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
      >
        <Icon name="minus" size={15} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isNaN(next)) return;
          onChange(Math.min(max, Math.max(min, Math.trunc(next))));
        }}
        className={cn(
          "h-full border-x border-line text-center text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500/25",
          size === "sm" ? "w-11" : "w-14",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
      />
      <button
        type="button"
        className={cn(button, "h-full")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}

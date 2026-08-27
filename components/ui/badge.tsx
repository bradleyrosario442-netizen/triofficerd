import type { ReactNode } from "react";
import { cn } from "@/lib/utils/format";

type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-600 text-white",
  success: "bg-fresh-50 text-fresh-700",
  warning: "bg-amber-50 text-amber-700",
  dark: "bg-ink text-white",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

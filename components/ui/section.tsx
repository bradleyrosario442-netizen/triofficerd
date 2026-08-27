import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

const paddings = {
  default: "py-14 sm:py-16 lg:py-20",
  compact: "py-10 sm:py-12 lg:py-14",
  none: "",
} as const;

export function Section({
  children,
  className,
  tone = "default",
  padding = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "canvas" | "dark";
  /** El espaciado es una prop y no una clase para evitar utilidades en conflicto. */
  padding?: keyof typeof paddings;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        paddings[padding],
        tone === "canvas" && "bg-canvas",
        tone === "dark" && "bg-brand-900 text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-10",
        align === "left" ? "sm:flex-row sm:items-end sm:justify-between" : "items-center text-center",
        className,
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-2 text-xs font-semibold uppercase tracking-[0.14em]",
              tone === "dark" ? "text-brand-200" : "text-brand-600",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-2xl font-semibold sm:text-3xl",
            tone === "dark" ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3 max-w-2xl text-[15px] leading-relaxed",
              tone === "dark" ? "text-brand-100/85" : "text-muted",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors",
            tone === "dark" ? "text-white hover:text-brand-200" : "text-brand-700 hover:text-brand-900",
          )}
        >
          {action.label}
          <Icon
            name="arrow-right"
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}

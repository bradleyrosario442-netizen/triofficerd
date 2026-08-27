import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

/**
 * Botón de llamada principal: píldora con la insignia circular de flecha.
 * Es el gesto que ancla el hero y los cierres de sección.
 */
export function PillLink({
  href,
  children,
  tone = "lime",
  size = "lg",
  className,
  target,
  rel,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "lime" | "dark" | "white";
  size?: "md" | "lg";
  className?: string;
  target?: string;
  rel?: string;
}) {
  const tones = {
    lime: "bg-fresh-500 text-ink hover:bg-fresh-600 hover:text-white",
    dark: "bg-ink text-white hover:bg-brand-900",
    white: "bg-white text-ink hover:bg-brand-50",
  } as const;

  const badges = {
    lime: "bg-ink text-white",
    dark: "bg-fresh-500 text-ink",
    white: "bg-ink text-white",
  } as const;

  const sizes = {
    md: "h-11 pl-5 pr-1.5 text-[13px]",
    lg: "h-14 pl-7 pr-2 text-[14px]",
  } as const;

  const badgeSizes = { md: "h-8 w-8", lg: "h-10 w-10" } as const;
  const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");

  const content = (
    <>
      <span className="font-semibold uppercase tracking-[0.08em]">{children}</span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5",
          badges[tone],
          badgeSizes[size],
        )}
      >
        <Icon name="arrow-right" size={size === "lg" ? 18 : 15} />
      </span>
    </>
  );

  const classes = cn(
    "group inline-flex items-center gap-3 rounded-full transition-colors duration-200",
    tones[tone],
    sizes[size],
    className,
  );

  if (isExternal) {
    return (
      <a href={href} className={classes} target={target} rel={rel}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

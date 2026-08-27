import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { site } from "@/lib/data/site";

export interface Crumb {
  label: string;
  href?: string;
}

/** Migas de pan + JSON-LD BreadcrumbList para resultados enriquecidos. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: "Inicio", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${site.url}${crumb.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Ruta de navegación" className="text-[13px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="transition-colors hover:text-brand-700">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-ink" : undefined} aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
              {!isLast ? <Icon name="chevron-right" size={14} className="text-slate-300" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

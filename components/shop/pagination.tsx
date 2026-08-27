import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

/** Paginación enlazable: cada página es una URL indexable. */
export function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number;
  pages: number;
  basePath: string;
  params: URLSearchParams;
}) {
  if (pages <= 1) return null;

  const hrefFor = (target: number) => {
    const next = new URLSearchParams(params.toString());
    if (target <= 1) next.delete("pagina");
    else next.set("pagina", String(target));
    const query = next.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  };

  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (number) => number === 1 || number === pages || Math.abs(number - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Paginación">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-line px-3 text-[13px] font-medium text-ink transition-colors hover:border-brand-300"
          rel="prev"
        >
          <Icon name="chevron-left" size={15} />
          Anterior
        </Link>
      ) : null}

      {numbers.map((number, index) => {
        const previous = numbers[index - 1];
        const gap = previous && number - previous > 1;
        return (
          <span key={number} className="flex items-center gap-1.5">
            {gap ? <span className="px-1 text-muted">…</span> : null}
            <Link
              href={hrefFor(number)}
              aria-current={number === page ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-[13px] font-medium transition-colors",
                number === page
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-line text-ink hover:border-brand-300",
              )}
            >
              {number}
            </Link>
          </span>
        );
      })}

      {page < pages ? (
        <Link
          href={hrefFor(page + 1)}
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-line px-3 text-[13px] font-medium text-ink transition-colors hover:border-brand-300"
          rel="next"
        >
          Siguiente
          <Icon name="chevron-right" size={15} />
        </Link>
      ) : null}
    </nav>
  );
}

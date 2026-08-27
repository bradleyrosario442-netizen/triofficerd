"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "@/components/search/use-search";
import { Icon } from "@/components/ui/icon";
import { popularSearches } from "@/lib/services/catalog";
import { useUI } from "@/lib/store/ui-context";
import { cn, formatCurrency } from "@/lib/utils/format";

interface Hit {
  href: string;
  label: string;
}

export function SearchDialog() {
  const { isOpen, closePanel } = useUI();
  const open = isOpen("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading } = useSearch(query, open);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(-1);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
  }, [open]);

  const flat = useMemo<Hit[]>(
    () => [
      ...results.products.map((product) => ({
        href: `/producto/${product.slug}`,
        label: product.name,
      })),
      ...results.suggestions.map((suggestion) => ({
        href: suggestion.href,
        label: suggestion.label,
      })),
      ...results.categories.map((category) => ({
        href: `/categoria/${category.slug}`,
        label: category.name,
      })),
      ...results.brands.map((brand) => ({
        href: `/tienda?marca=${brand.slug}`,
        label: brand.name,
      })),
    ],
    [results],
  );

  const goToResults = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    closePanel();
    router.push(`/tienda?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((current) => Math.min(flat.length - 1, current + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((current) => Math.max(-1, current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (cursor >= 0 && flat[cursor]) {
        closePanel();
        router.push(flat[cursor].href);
      } else {
        goToResults(query);
      }
    }
  };

  if (!open) return null;

  const hasQuery = query.trim().length >= 2;
  const isEmpty = hasQuery && !loading && flat.length === 0;
  let index = -1;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Buscar en Tri Office">
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        onClick={closePanel}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45 backdrop-blur-[2px] animate-fade-in"
      />

      <div className="relative mx-auto mt-0 flex h-full w-full max-w-2xl flex-col px-0 sm:mt-[8vh] sm:h-auto sm:px-4">
        <div className="flex h-full flex-col overflow-hidden bg-white shadow-pop sm:h-auto sm:rounded-xl animate-slide-down">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Icon name="search" size={20} className="shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCursor(-1);
              }}
              onKeyDown={onKeyDown}
              type="search"
              placeholder="Busca productos, categorías o marcas…"
              className="h-9 w-full border-0 bg-transparent text-[15px] text-ink placeholder:text-slate-400 focus:outline-none"
              aria-label="Término de búsqueda"
            />
            <button
              type="button"
              onClick={closePanel}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
              aria-label="Cerrar"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scroll-thin sm:max-h-[62vh]">
            {!hasQuery ? (
              <div className="p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Búsquedas frecuentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {loading && hasQuery ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {isEmpty ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-ink">Sin resultados para “{query.trim()}”</p>
                <p className="mt-1 text-[13px] text-muted">
                  Prueba con otro término o escríbenos y te ayudamos a ubicar el producto.
                </p>
              </div>
            ) : null}

            {!loading && results.products.length > 0 ? (
              <section className="border-t border-line first:border-t-0">
                <h2 className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Productos
                </h2>
                <ul>
                  {results.products.map((product) => {
                    index += 1;
                    const current = index;
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setCursor(current)}
                          onClick={() => {
                            closePanel();
                            router.push(`/producto/${product.slug}`);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            cursor === current ? "bg-brand-50" : "hover:bg-slate-50",
                          )}
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
                            <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium text-ink">{product.name}</span>
                            <span className="block truncate text-[12px] text-muted">
                              {product.brand} · {product.subcategory}
                            </span>
                          </span>
                          <span className="shrink-0 text-[13px] font-semibold text-ink">
                            {product.price === null ? "Cotizar" : formatCurrency(product.price)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {!loading && results.suggestions.length > 0 ? (
              <section className="border-t border-line">
                <h2 className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Subcategorías
                </h2>
                <ul className="pb-2">
                  {results.suggestions.map((suggestion) => {
                    index += 1;
                    const current = index;
                    return (
                      <li key={suggestion.href}>
                        <button
                          type="button"
                          onMouseEnter={() => setCursor(current)}
                          onClick={() => {
                            closePanel();
                            router.push(suggestion.href);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-4 py-2 text-left text-[14px] transition-colors",
                            cursor === current ? "bg-brand-50" : "hover:bg-slate-50",
                          )}
                        >
                          <Icon name="chevron-right" size={14} className="text-slate-400" />
                          <span className="text-ink">{suggestion.label}</span>
                          <span className="text-[12px] text-muted">en {suggestion.parent}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {!loading && (results.categories.length > 0 || results.brands.length > 0) ? (
              <section className="border-t border-line px-4 py-3">
                {results.categories.length > 0 ? (
                  <>
                    <h2 className="pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Categorías
                    </h2>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {results.categories.map((category) => {
                        index += 1;
                        const current = index;
                        return (
                          <button
                            key={category.slug}
                            type="button"
                            onMouseEnter={() => setCursor(current)}
                            onClick={() => {
                              closePanel();
                              router.push(`/categoria/${category.slug}`);
                            }}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
                              cursor === current
                                ? "border-brand-300 bg-brand-50 text-brand-700"
                                : "border-line text-ink hover:border-brand-300",
                            )}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : null}

                {results.brands.length > 0 ? (
                  <>
                    <h2 className="pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Marcas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {results.brands.map((brand) => {
                        index += 1;
                        const current = index;
                        return (
                          <button
                            key={brand.slug}
                            type="button"
                            onMouseEnter={() => setCursor(current)}
                            onClick={() => {
                              closePanel();
                              router.push(`/tienda?marca=${brand.slug}`);
                            }}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
                              cursor === current
                                ? "border-brand-300 bg-brand-50 text-brand-700"
                                : "border-line text-ink hover:border-brand-300",
                            )}
                          >
                            {brand.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}
          </div>

          {hasQuery ? (
            <button
              type="button"
              onClick={() => goToResults(query)}
              className="flex items-center justify-between border-t border-line bg-canvas px-4 py-3 text-left text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              Ver todos los resultados para “{query.trim()}”
              <Icon name="arrow-right" size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

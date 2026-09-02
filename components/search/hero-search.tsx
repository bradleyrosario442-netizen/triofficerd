"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/components/search/use-search";
import { Icon } from "@/components/ui/icon";
import { popularSearches } from "@/lib/data/catalog-meta";

/** Buscador destacado de la portada, con resultados predictivos en línea. */
export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const { results, loading } = useSearch(query, focused);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setFocused(false);
    router.push(`/tienda?q=${encodeURIComponent(trimmed)}`);
  };

  const showPanel = focused && query.trim().length >= 2;
  const nothing = showPanel && !loading && results.products.length === 0 && results.suggestions.length === 0;

  return (
    <div ref={container} className="relative w-full">
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor="hero-search" className="sr-only">
          ¿Qué estás buscando?
        </label>
        <Icon
          name="search"
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => event.key === "Escape" && setFocused(false)}
          placeholder="¿Qué estás buscando? Ej. laptop, tóner HP, escritorio"
          className="h-14 w-full rounded-xl border border-line bg-white pl-12 pr-32 text-[15px] text-ink shadow-card transition-shadow placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 sm:pr-36"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Buscar
          <Icon name="arrow-right" size={16} className="hidden sm:block" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px]">
        <span className="text-muted">Populares:</span>
        {popularSearches.slice(0, 4).map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setQuery(term);
              setFocused(true);
            }}
            className="rounded-full bg-white/80 px-2.5 py-0.5 text-brand-800 ring-1 ring-line transition-colors hover:bg-white hover:ring-brand-300"
          >
            {term}
          </button>
        ))}
      </div>

      {showPanel ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-pop animate-slide-down">
          {loading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : nothing ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">
              No encontramos resultados para “{query.trim()}”.
            </p>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto scroll-thin">
                {results.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/producto/${product.slug}`}
                      onClick={() => setFocused(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
                        <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-ink">{product.name}</span>
                        <span className="block truncate text-[12px] text-muted">{product.brand}</span>
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold text-ink">
                        {"Cotizar"}
                      </span>
                    </Link>
                  </li>
                ))}
                {results.suggestions.map((suggestion) => (
                  <li key={suggestion.href}>
                    <Link
                      href={suggestion.href}
                      onClick={() => setFocused(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[13px] transition-colors hover:bg-slate-50"
                    >
                      <Icon name="chevron-right" size={14} className="text-slate-400" />
                      <span className="text-ink">{suggestion.label}</span>
                      <span className="text-muted">en {suggestion.parent}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/tienda?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setFocused(false)}
                className="flex items-center justify-between border-t border-line bg-canvas px-4 py-2.5 text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
              >
                Ver todos los resultados
                <Icon name="arrow-right" size={15} />
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AvailabilityLabel, PriceTag, ProductBadges } from "@/components/product/price";
import { Icon } from "@/components/ui/icon";
import { getBrandName } from "@/lib/services/catalog";
import { useCart } from "@/lib/store/cart-context";
import { useQuote } from "@/lib/store/quote-context";
import { useUI } from "@/lib/store/ui-context";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils/format";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, view = "grid", priority, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToQuote, contains } = useQuote();
  const { openPanel } = useUI();
  const [added, setAdded] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const flag = (setter: (value: boolean) => void) => {
    setter(true);
    timers.current.push(window.setTimeout(() => setter(false), 1800));
  };

  const href = `/producto/${product.slug}`;
  const brandName = getBrandName(product.brand);
  const soldOut = product.availability === "out_of_stock";
  const quoteOnly = product.quoteOnly || product.price === null;
  const inQuote = contains(product.id);

  const handleAddToCart = () => {
    addItem(product, 1);
    flag(setAdded);
    openPanel("cart");
  };

  const handleAddToQuote = () => {
    addToQuote(product, 1);
    flag(setQuoted);
  };

  const media = (
    <Link
      href={href}
      className={cn(
        "relative block overflow-hidden bg-canvas",
        view === "grid" ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square sm:h-full sm:w-44 sm:shrink-0",
      )}
      tabIndex={-1}
      aria-hidden="true"
    >
      <Image
        src={product.images[0]}
        alt=""
        fill
        sizes={view === "grid" ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px" : "200px"}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        priority={priority}
      />
      <ProductBadges product={product} className="absolute left-3 top-3" />
    </Link>
  );

  const info = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-600">{brandName}</p>
      <h3 className="mt-1 text-[15px] font-medium leading-snug text-ink">
        <Link href={href} className="line-clamp-2 transition-colors hover:text-brand-700">
          {product.name}
        </Link>
      </h3>
      <p className={cn("mt-1.5 text-[13px] leading-relaxed text-muted", view === "grid" ? "line-clamp-2" : "line-clamp-2 sm:line-clamp-3")}>
        {product.shortDescription}
      </p>
    </>
  );

  const pricing = (
    <div className={cn("mt-3", view === "list" && "sm:mt-4")}>
      <PriceTag price={product.price} previousPrice={product.previousPrice} />
      <AvailabilityLabel availability={product.availability} className="mt-1.5" />
    </div>
  );

  const actions = (
    <div className={cn("mt-4 flex flex-col gap-2", view === "list" && "sm:mt-4")}>
      <div className="flex gap-2">
        {quoteOnly ? (
          <button
            type="button"
            onClick={handleAddToQuote}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-700 px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-800"
          >
            <Icon name={quoted || inQuote ? "check" : "quote"} size={16} />
            {quoted ? "Agregado" : inQuote ? "En cotización" : "Solicitar cotización"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut}
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors",
              soldOut
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : added
                  ? "bg-fresh-600 text-white"
                  : "bg-brand-700 text-white hover:bg-brand-800",
            )}
          >
            <Icon name={added ? "check" : "cart"} size={16} />
            {soldOut ? "Agotado" : added ? "Agregado" : "Agregar al carrito"}
          </button>
        )}

        {!quoteOnly ? (
          <button
            type="button"
            onClick={handleAddToQuote}
            title="Agregar a la cotización empresarial"
            aria-label={`Agregar ${product.name} a la cotización empresarial`}
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
              inQuote || quoted
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-line text-muted hover:border-brand-300 hover:text-brand-700",
            )}
          >
            <Icon name={inQuote || quoted ? "check" : "quote"} size={16} />
          </button>
        ) : null}
      </div>

      <Link
        href={href}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line text-[13px] font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        Ver producto
        <Icon name="chevron-right" size={14} />
      </Link>
    </div>
  );

  if (view === "list") {
    return (
      <article
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-200 hover:border-brand-200 hover:shadow-lift sm:flex-row",
          className,
        )}
      >
        {media}
        <div className="flex flex-1 flex-col justify-between gap-2 p-4 sm:flex-row sm:gap-6 sm:p-5">
          <div className="sm:max-w-md">{info}</div>
          <div className="sm:w-56 sm:shrink-0 sm:border-l sm:border-line sm:pl-5">
            {pricing}
            {actions}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-200 hover:border-brand-200 hover:shadow-lift",
        className,
      )}
    >
      {media}
      <div className="flex flex-1 flex-col p-4">
        {info}
        <div className="mt-auto">
          {pricing}
          {actions}
        </div>
      </div>
    </article>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductBadges } from "@/components/product/price";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils/format";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[4/3] flex-1 overflow-hidden rounded-xl border border-line bg-canvas">
        <Image
          key={product.images[active]}
          src={product.images[active]}
          alt={`${product.name} — vista ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 620px"
          className="animate-fade-in object-cover"
        />
        <ProductBadges product={product} className="absolute left-4 top-4" />
      </div>

      {product.images.length > 1 ? (
        <div
          className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0"
          role="tablist"
          aria-label="Imágenes del producto"
        >
          {product.images.map((image, index) => (
            <button
              key={image}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Ver imagen ${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border bg-canvas transition-all",
                index === active
                  ? "border-brand-500 ring-2 ring-brand-500/20"
                  : "border-line hover:border-slate-300",
              )}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

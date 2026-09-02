"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import type { Product } from "@/lib/types";
import { whatsappForProduct } from "@/lib/utils/whatsapp";

interface Item {
  product: Product;
  brandName: string;
  categoryName: string;
}

/**
 * Carrusel horizontal del catálogo: imagen, marca, nombre y categoría, con el
 * botón de cotizar directo a WhatsApp. Sin precio, como el resto del catálogo.
 */
export function TopPicks({ title, items }: { title: string; items: Item[] }) {
  const track = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * (node.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <Container className="py-10 lg:py-14">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
        <div className="flex items-end justify-between lg:flex-col lg:items-start lg:justify-start">
          <div>
            <h2 className="font-display text-[26px] font-extrabold uppercase leading-[1.05] tracking-[-0.02em] text-ink sm:text-[30px]">
              {title}
            </h2>
            <span className="mt-3 block h-1 w-10 rounded-full bg-brand-600" />
          </div>

          <div className="flex gap-2 lg:mt-auto lg:pt-8">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Anterior"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Siguiente"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-brand-800"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>
        </div>

        <ul ref={track} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {items.map(({ product, brandName, categoryName }) => (
            <li key={product.id} className="w-[210px] shrink-0 snap-start sm:w-[232px]">
              <div className="group flex h-full flex-col rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-lift">
                <Link
                  href={`/producto/${product.slug}`}
                  className="relative block aspect-square overflow-hidden rounded-xl bg-canvas"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Image
                    src={product.images[0]}
                    alt=""
                    fill
                    sizes="232px"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="mt-3.5 flex flex-1 flex-col px-1 pb-1">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">
                    {brandName}
                  </p>
                  <Link
                    href={`/producto/${product.slug}`}
                    className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-ink hover:text-brand-700"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-[11.5px] text-muted">{categoryName}</p>

                  <a
                    href={whatsappForProduct(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-fresh-500 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-fresh-600 hover:text-white"
                  >
                    <Icon name="whatsapp" size={14} />
                    Cotizar
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

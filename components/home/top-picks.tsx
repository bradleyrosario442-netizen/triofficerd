"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { useCart } from "@/lib/store/cart-context";
import { useUI } from "@/lib/store/ui-context";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

/**
 * Carrusel horizontal de selección: tarjeta mínima —imagen, nombre, precio y
 * un botón redondo que agrega al carrito sin salir de la portada.
 */
export function TopPicks({ title, products }: { title: string; products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);
  const { addItem } = useCart();
  const { openPanel } = useUI();

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

        <ul
          ref={track}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar"
        >
          {products.map((product) => (
            <li
              key={product.id}
              className="w-[210px] shrink-0 snap-start sm:w-[232px]"
            >
              <div className="group flex h-full flex-col rounded-2xl bg-white p-3 shadow-card transition-shadow hover:shadow-lift">
                <Link
                  href={`/producto/${product.slug}`}
                  className="relative block aspect-square overflow-hidden rounded-xl bg-canvas"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="232px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="mt-3.5 flex flex-1 items-end justify-between gap-2 px-1 pb-1">
                  <div className="min-w-0">
                    <Link
                      href={`/producto/${product.slug}`}
                      className="line-clamp-2 text-[13px] font-medium leading-snug text-ink hover:text-brand-700"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[14px] font-bold text-ink">
                      {product.price === null ? "Cotización" : formatCurrency(product.price)}
                    </p>
                  </div>

                  {product.price === null ? (
                    <Link
                      href={`/producto/${product.slug}`}
                      aria-label={`Ver ${product.name}`}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100"
                    >
                      <Icon name="arrow-right" size={16} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addItem(product, 1);
                        openPanel("cart");
                      }}
                      aria-label={`Agregar ${product.name} al carrito`}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fresh-500 text-ink transition-colors hover:bg-fresh-600 hover:text-white"
                    >
                      <Icon name="plus" size={17} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}

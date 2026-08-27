import Image from "next/image";
import Link from "next/link";
import { PriceTag } from "@/components/product/price";
import { Icon } from "@/components/ui/icon";
import { getBrandName } from "@/lib/services/catalog";
import type { Product } from "@/lib/types";

/** Lista compacta de productos: aporta ritmo frente a las rejillas de tarjetas. */
export function ProductRail({
  title,
  description,
  href,
  linkLabel = "Ver todos",
  products,
}: {
  title: string;
  description?: string;
  href: string;
  linkLabel?: string;
  products: Product[];
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
          {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
        </div>
        <Link
          href={href}
          className="group mt-0.5 inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-brand-700 hover:text-brand-900"
        >
          {linkLabel}
          <Icon name="chevron-right" size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ul className="divide-y divide-line">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/producto/${product.slug}`}
              className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-canvas"
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
                <Image
                  src={product.images[0]}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                  {getBrandName(product.brand)}
                </span>
                <span className="mt-0.5 block truncate text-[14px] font-medium text-ink transition-colors group-hover:text-brand-700">
                  {product.name}
                </span>
                <PriceTag
                  price={product.price}
                  previousPrice={product.previousPrice}
                  size="sm"
                  className="mt-1"
                />
              </span>
              <Icon
                name="chevron-right"
                size={16}
                className="shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { getBrandName, getCategory, getSubcategory } from "@/lib/services/catalog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils/format";
import { whatsappForProduct } from "@/lib/utils/whatsapp";

/**
 * Tarjeta del catálogo.
 *
 * Muestra imagen, marca, nombre y categoría. No lleva precio ni descripción:
 * el catálogo es de cotización, y el botón COTIZAR abre WhatsApp con el
 * producto ya identificado.
 */
interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, view = "grid", priority, className }: ProductCardProps) {
  const href = `/producto/${product.slug}`;
  const brandName = getBrandName(product.brand);
  const categoryName = getCategory(product.category)?.name ?? "";
  const subcategoryName = getSubcategory(product.category, product.subcategory)?.name ?? "";

  const media = (
    <Link
      href={href}
      className={cn(
        "relative block overflow-hidden bg-canvas",
        view === "list" ? "aspect-square w-full sm:w-44" : "aspect-square w-full",
      )}
      tabIndex={-1}
      aria-hidden="true"
    >
      <Image
        src={product.images[0]}
        alt=""
        fill
        sizes={view === "list" ? "176px" : "(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </Link>
  );

  const body = (
    <div className="flex flex-1 flex-col p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-600">{brandName}</p>

      <h3 className="mt-1.5">
        <Link
          href={href}
          className="line-clamp-3 text-[14px] font-medium leading-snug text-ink transition-colors hover:text-brand-700"
        >
          {product.name}
        </Link>
      </h3>

      <p className="mt-2 text-[12px] text-muted">
        {subcategoryName || categoryName}
        {product.sku && product.sku !== "—" ? (
          <span className="block text-[11.5px] text-slate-400">Parte: {product.sku}</span>
        ) : null}
      </p>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <a
          href={whatsappForProduct(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-fresh-500 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-fresh-600 hover:text-white"
        >
          <Icon name="whatsapp" size={16} />
          Cotizar
        </a>
        <Link
          href={href}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-line text-[13px] font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          Ver producto
          <Icon name="chevron-right" size={15} />
        </Link>
      </div>
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
        {body}
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
      {body}
    </article>
  );
}

import { Icon } from "@/components/ui/icon";
import { discountPercent } from "@/lib/services/pricing";
import type { Product, ProductAvailability } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils/format";

export function PriceTag({
  price,
  previousPrice,
  size = "md",
  className,
}: {
  price: number | null;
  previousPrice: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const percent = discountPercent(price, previousPrice);

  if (price === null) {
    return (
      <p
        className={cn(
          "font-semibold text-brand-800",
          size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm",
          className,
        )}
      >
        Precio por cotización
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "font-semibold tracking-tight text-ink",
          size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-[15px]",
        )}
      >
        {formatCurrency(price)}
      </span>
      {previousPrice && previousPrice > price ? (
        <>
          <span
            className={cn(
              "text-muted line-through",
              size === "lg" ? "text-base" : "text-[13px]",
            )}
          >
            {formatCurrency(previousPrice)}
          </span>
          {percent ? (
            <span className="rounded-md bg-accent-50 px-1.5 py-0.5 text-[11px] font-semibold text-accent-700">
              -{percent}%
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const availabilityLabels: Record<ProductAvailability, { label: string; className: string }> = {
  in_stock: { label: "Disponible", className: "text-fresh-700" },
  low_stock: { label: "Últimas unidades", className: "text-amber-700" },
  out_of_stock: { label: "Agotado", className: "text-slate-500" },
  on_request: { label: "Bajo pedido", className: "text-brand-700" },
};

export function AvailabilityLabel({
  availability,
  showStock,
  stock,
  className,
}: {
  availability: ProductAvailability;
  showStock?: boolean;
  stock?: number;
  className?: string;
}) {
  const meta = availabilityLabels[availability];
  return (
    <p className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", meta.className, className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          availability === "in_stock" && "bg-fresh-500",
          availability === "low_stock" && "bg-amber-500",
          availability === "out_of_stock" && "bg-slate-400",
          availability === "on_request" && "bg-brand-500",
        )}
      />
      {meta.label}
      {showStock && typeof stock === "number" && stock > 0 ? (
        <span className="font-normal text-muted">· {stock} en almacén</span>
      ) : null}
    </p>
  );
}

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const percent = discountPercent(product.price, product.previousPrice);
  return (
    <div className={cn("pointer-events-none flex flex-wrap gap-1.5", className)}>
      {product.sale && percent ? (
        <span className="rounded-md bg-accent-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Oferta -{percent}%
        </span>
      ) : null}
      {product.isNew ? (
        <span className="rounded-md bg-brand-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Nuevo
        </span>
      ) : null}
      {product.bestseller ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink shadow-card">
          <Icon name="star" size={11} className="text-accent-500" />
          Más vendido
        </span>
      ) : null}
      {product.featured && !product.sale && !product.isNew ? (
        <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800 shadow-card">
          Destacado
        </span>
      ) : null}
    </div>
  );
}

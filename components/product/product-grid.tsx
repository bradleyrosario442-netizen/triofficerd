import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils/format";

export function ProductGrid({
  products,
  view = "grid",
  columns = 4,
  priorityCount = 0,
  className,
}: {
  products: Product[];
  view?: "grid" | "list";
  columns?: 3 | 4;
  priorityCount?: number;
  className?: string;
}) {
  if (view === "list") {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} view="list" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-5",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        "md:grid-cols-3",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}

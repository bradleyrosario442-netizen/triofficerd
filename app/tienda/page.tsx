import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/shop/catalog-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/section";
import { parseShopParams, type RawParams } from "@/lib/services/shop-params";

export const metadata: Metadata = {
  title: "Tienda en línea",
  description:
    "Catálogo de tecnología, mobiliario, impresión, materiales de oficina, limpieza y artículos escolares. Filtra por categoría, marca, precio y disponibilidad.",
  alternates: { canonical: "/tienda" },
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;
  const state = parseShopParams(params);

  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs items={[{ label: "Tienda" }]} />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
                {state.raw.q ? `Resultados para “${state.raw.q}”` : "Tienda en línea"}
              </h1>
              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
                {state.raw.q
                  ? "Productos que coinciden con tu búsqueda dentro del catálogo publicado."
                  : "Todo el catálogo disponible: filtra por categoría, marca, precio y disponibilidad."}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogView state={state} basePath="/tienda" />
        </Suspense>
      </Container>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[254px_1fr]">
      <div className="hidden h-96 animate-pulse rounded-xl bg-canvas lg:block" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-xl bg-canvas" />
        ))}
      </div>
    </div>
  );
}

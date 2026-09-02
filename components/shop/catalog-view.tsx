import { ProductGrid } from "@/components/product/product-grid";
import { ActiveFilters, type ActiveFilterChip } from "@/components/shop/active-filters";
import { FiltersPanel } from "@/components/shop/filters-panel";
import { Pagination } from "@/components/shop/pagination";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  filterProducts,
  getBrandName,
  getBrandsForCategory,
  getCategories,
  getCategory,
  getSubcategory,
  paginate,
  sortProducts,
} from "@/lib/services/catalog";
import { PAGE_SIZE, sortOptions, type ShopState } from "@/lib/services/shop-params";

interface CatalogViewProps {
  state: ShopState;
  basePath: string;
  /** Cuando la ruta ya define la categoría, el filtro correspondiente se oculta. */
  lockedCategory?: string;
  lockedSubcategory?: string;
}

export function CatalogView({
  state,
  basePath,
  lockedCategory,
  lockedSubcategory,
}: CatalogViewProps) {
  const { filters, sort, view, page, raw } = state;

  const effectiveFilters = {
    ...filters,
    category: lockedCategory ?? filters.category,
    subcategory: lockedSubcategory ?? filters.subcategory,
  };

  const filtered = sortProducts(filterProducts(effectiveFilters), sort);
  const paged = paginate(filtered, page, PAGE_SIZE);

  const categories = getCategories();
  const brands = getBrandsForCategory(lockedCategory ?? filters.category);

  const chips: ActiveFilterChip[] = [];
  if (raw.q) chips.push({ key: "q", label: `Búsqueda: “${raw.q}”` });
  if (!lockedCategory && raw.categoria) {
    chips.push({ key: "categoria", label: getCategory(raw.categoria)?.name ?? raw.categoria });
  }
  if (!lockedSubcategory && raw.subcategoria) {
    const parent = lockedCategory ?? raw.categoria;
    chips.push({
      key: "subcategoria",
      label: getSubcategory(parent, raw.subcategoria)?.name ?? raw.subcategoria,
    });
  }
  raw.marcas.forEach((brand) =>
    chips.push({ key: "marca", value: brand, label: getBrandName(brand) }),
  );

  const params = new URLSearchParams();
  Object.entries({
    q: raw.q,
    categoria: lockedCategory ? "" : raw.categoria,
    subcategoria: lockedSubcategory ? "" : raw.subcategoria,
    marca: raw.marcas.join(","),
    orden: sort === "relevance" ? "" : (sortOptions.find((o) => o.value === sort)?.param ?? ""),
    vista: view === "list" ? "lista" : "",
  }).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[254px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-32 rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
            <Icon name="sliders" size={16} className="text-brand-700" />
            Filtrar
          </h2>
          <FiltersPanel categories={categories} brands={brands} lockedCategory={lockedCategory} />
        </div>
      </aside>

      <div>
        <ShopToolbar
          total={paged.total}
          showing={paged.items.length}
          view={view}
          categories={categories}
          brands={brands}
          lockedCategory={lockedCategory}
          activeFilterCount={chips.length}
        />

        <ActiveFilters chips={chips} />

        {paged.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-canvas px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-muted shadow-card">
              <Icon name="search" size={22} />
            </span>
            <h3 className="mt-4 text-[16px] font-semibold text-ink">
              No encontramos productos con estos filtros
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
              Ajusta los criterios o escríbenos: trabajamos con un catálogo más amplio del que se
              muestra en línea.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
              <LinkButton href={basePath} variant="outline">
                Quitar filtros
              </LinkButton>
              <LinkButton href="/cotizacion">
                <Icon name="quote" size={16} />
                Solicitar cotización
              </LinkButton>
            </div>
          </div>
        ) : (
          <>
            <div className="pt-2">
              <ProductGrid products={paged.items} view={view} columns={3} priorityCount={3} />
            </div>
            <Pagination page={paged.page} pages={paged.pages} basePath={basePath} params={params} />
          </>
        )}
      </div>
    </div>
  );
}

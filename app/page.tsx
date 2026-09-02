import type { Metadata } from "next";
import { BrandsStrip } from "@/components/home/brands-strip";
import { CategoryStrip } from "@/components/home/category-strip";
import { ClosingCta } from "@/components/home/closing-cta";
import { Hero } from "@/components/home/hero";
import { Pillars } from "@/components/home/pillars";
import { StatsBand } from "@/components/home/stats-band";
import { TopPicks } from "@/components/home/top-picks";
import { ProductGrid } from "@/components/product/product-grid";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import {
  getActiveBrands,
  getBestsellers,
  getBrandName,
  getFeaturedProducts,
  getHighlightedCategories,
  getNewArrivals,
  getProducts,
  getSubcategory,
} from "@/lib/services/catalog";
import { site } from "@/lib/data/site";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const categories = getHighlightedCategories();
  const brands = getActiveBrands();
  const total = getProducts().length;

  /** Ninguna sección repite un producto ya mostrado más arriba. */
  const shown = new Set<string>();
  const take = (list: Product[], amount: number): Product[] => {
    const picked: Product[] = [];
    for (const product of list) {
      if (shown.has(product.id)) continue;
      shown.add(product.id);
      picked.push(product);
      if (picked.length === amount) break;
    }
    return picked;
  };

  /** El carrusel necesita marca y categoría ya resueltas: son datos del servidor. */
  const decorate = (list: Product[]) =>
    list.map((product) => ({
      product,
      brandName: getBrandName(product.brand),
      categoryName: getSubcategory(product.category, product.subcategory)?.name ?? "",
    }));

  const [deal] = take(getFeaturedProducts(1), 1);
  const picks = decorate(take(getFeaturedProducts(40), 10));
  const grid = take(getBestsellers(40), 8);
  const arrivals = decorate(take(getNewArrivals(40), 10));

  return (
    <div className="bg-mist">
      <Hero deal={deal} total={total} />
      <Pillars />
      <CategoryStrip categories={categories} />
      <TopPicks title="Del catálogo" items={picks} />

      <Section padding="compact" className="bg-white">
        <Container>
          <SectionHeading
            title="Equipamiento de oficina"
            action={{ href: "/tienda", label: "Ver catálogo" }}
            className="mb-6 sm:mb-7"
          />
          <ProductGrid products={grid} priorityCount={4} />
        </Container>
      </Section>

      <StatsBand total={total} brands={brands.length} />
      <TopPicks title="Tecnología y redes" items={arrivals} />

      <Section padding="compact" className="bg-white">
        <Container>
          <SectionHeading
            title="Marcas"
            action={{ href: "/marcas", label: "Ver todas" }}
            className="mb-6 sm:mb-7"
          />
          <BrandsStrip brands={brands.slice(0, 10)} />
        </Container>
      </Section>

      <ClosingCta />
    </div>
  );
}

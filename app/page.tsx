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
  getFeaturedProducts,
  getHighlightedCategories,
  getNewArrivals,
  getOnSaleProducts,
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

  const [deal] = take(getOnSaleProducts(30), 1);
  const picks = take(getFeaturedProducts(30), 8);
  const offers = take(getOnSaleProducts(30), 4);
  const newArrivals = take(getNewArrivals(40), 8);
  const bestsellers = take(getBestsellers(30), 4);

  return (
    <div className="bg-mist">
      <Hero deal={deal} />
      <Pillars />
      <CategoryStrip categories={categories} />
      <TopPicks title="Nuestra selección" products={picks} />

      {offers.length > 0 ? (
        <Section padding="compact" className="bg-white">
          <Container>
            <SectionHeading
              title="Ofertas vigentes"
              action={{ href: "/tienda?oferta=1", label: "Ver todas" }}
              className="mb-6 sm:mb-7"
            />
            <ProductGrid products={[...offers, ...bestsellers]} priorityCount={2} />
          </Container>
        </Section>
      ) : null}

      <StatsBand />
      <TopPicks title="Recién llegado" products={newArrivals} />

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

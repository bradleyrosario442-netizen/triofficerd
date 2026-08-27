import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Carrito de compra",
  description: "Revisa los productos de tu carrito, ajusta cantidades y continúa al checkout.",
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-6">
          <Breadcrumbs items={[{ label: "Carrito" }]} />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
            Tu carrito
          </h1>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <CartPageContent />
      </Container>
    </>
  );
}

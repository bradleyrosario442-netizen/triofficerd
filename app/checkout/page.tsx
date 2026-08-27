import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Completa los datos de entrega y facturación para confirmar tu pedido.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-6">
          <Breadcrumbs items={[{ label: "Carrito", href: "/carrito" }, { label: "Checkout" }]} />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
            Finalizar compra
          </h1>
          <p className="mt-2 max-w-2xl text-[14.5px] text-muted">
            Completa tus datos y revisa el resumen antes de confirmar el pedido.
          </p>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <CheckoutForm />
      </Container>
    </>
  );
}

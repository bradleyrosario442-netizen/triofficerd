"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { QuantityInput } from "@/components/ui/quantity";
import { useCart } from "@/lib/store/cart-context";
import { useQuote } from "@/lib/store/quote-context";
import { useUI } from "@/lib/store/ui-context";
import type { Product } from "@/lib/types";
import { whatsappForProduct } from "@/lib/utils/whatsapp";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { addItem: addToQuote, contains } = useQuote();
  const { openPanel } = useUI();
  const [quantity, setQuantity] = useState(1);
  const [addedToQuote, setAddedToQuote] = useState(false);

  const quoteOnly = product.quoteOnly || product.price === null;
  const soldOut = product.availability === "out_of_stock";
  const inQuote = contains(product.id);

  const handleAdd = () => {
    addItem(product, quantity);
    openPanel("cart");
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  const handleQuote = () => {
    addToQuote(product, quantity);
    setAddedToQuote(true);
  };

  return (
    <div className="mt-6 border-t border-line pt-6">
      {!quoteOnly ? (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-ink">Cantidad</span>
            <QuantityInput value={quantity} onChange={setQuantity} max={Math.max(1, product.stock || 999)} />
          </div>
          {product.stock > 0 && product.stock <= 8 ? (
            <span className="text-[12px] text-amber-700">Quedan {product.stock} unidades</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {!quoteOnly ? (
          <>
            <Button onClick={handleAdd} disabled={soldOut} size="lg" className="sm:col-span-1">
              <Icon name="cart" size={18} />
              {soldOut ? "Producto agotado" : "Agregar al carrito"}
            </Button>
            <Button onClick={handleBuyNow} disabled={soldOut} variant="dark" size="lg">
              Comprar ahora
            </Button>
          </>
        ) : (
          <Button onClick={handleQuote} size="lg" className="sm:col-span-2">
            <Icon name={addedToQuote || inQuote ? "check" : "quote"} size={18} />
            {addedToQuote || inQuote ? "Agregado a la cotización" : "Agregar a la cotización"}
          </Button>
        )}

        {!quoteOnly ? (
          <Button onClick={handleQuote} variant="outline" size="lg">
            <Icon name={addedToQuote || inQuote ? "check" : "quote"} size={18} />
            {addedToQuote || inQuote ? "En cotización" : "Solicitar cotización"}
          </Button>
        ) : (
          <LinkButton href="/cotizacion" variant="outline" size="lg">
            Ver mi cotización
            <Icon name="arrow-right" size={16} />
          </LinkButton>
        )}

        <LinkButton
          href={whatsappForProduct(product)}
          variant="whatsapp"
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="whatsapp" size={18} />
          Consultar por WhatsApp
        </LinkButton>
      </div>

      {addedToQuote ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-brand-700">
          <Icon name="check-circle" size={15} />
          Agregado a tu lista de cotización empresarial.
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { QuantityInput } from "@/components/ui/quantity";
import { useQuote } from "@/lib/store/quote-context";
import type { Product } from "@/lib/types";
import { whatsappForProduct } from "@/lib/utils/whatsapp";

/**
 * Acciones de la ficha.
 *
 * El catálogo es de cotización, así que hay dos caminos: WhatsApp para una
 * consulta inmediata, o sumar el producto a la lista de cotización cuando se
 * está armando un requerimiento de varias líneas.
 */
export function ProductActions({ product }: { product: Product }) {
  const { addItem: addToQuote, contains } = useQuote();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inQuote = contains(product.id);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-medium text-muted">Cantidad</span>
        <QuantityInput value={quantity} onChange={setQuantity} max={9999} />
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <LinkButton
          href={whatsappForProduct(product)}
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-fresh-500 text-ink hover:bg-fresh-600 hover:text-white"
        >
          <Icon name="whatsapp" size={18} />
          Cotizar por WhatsApp
        </LinkButton>

        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            addToQuote(product, quantity);
            setAdded(true);
          }}
        >
          <Icon name={added || inQuote ? "check" : "quote"} size={17} />
          {added || inQuote ? "En tu cotización" : "Agregar a mi cotización"}
        </Button>
      </div>

      {added || inQuote ? (
        <LinkButton href="/cotizacion" variant="ghost" size="sm" className="mt-2.5">
          Ver mi cotización
          <Icon name="arrow-right" size={15} />
        </LinkButton>
      ) : null}
    </div>
  );
}

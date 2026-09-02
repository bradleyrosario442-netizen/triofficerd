import { site } from "@/lib/data/site";
import type { Product, QuoteItem } from "@/lib/types";

const base = `https://wa.me/${site.whatsapp}`;

export function whatsappLink(message: string): string {
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const whatsappGeneral = whatsappLink(
  `Hola ${site.name}, necesito información sobre sus productos y servicios.`,
);

/** Mensaje del botón COTIZAR: identifica el producto y pide precio y stock. */
export function whatsappForProduct(product: Product): string {
  const model = product.sku && product.sku !== "—" ? `
Número de parte: ${product.sku}` : "";
  return whatsappLink(
    `Hola ${site.name}, quiero cotizar el siguiente producto:

${product.name}${model}

¿Podrían indicarme precio y disponibilidad?`,
  );
}

export function whatsappForQuote(reference: string, items: QuoteItem[]): string {
  const detail = items
    .slice(0, 8)
    .map((item) => `• ${item.quantity} x ${item.name}`)
    .join("\n");
  const extra = items.length > 8 ? `\n…y ${items.length - 8} artículo(s) más.` : "";
  return whatsappLink(
    `Hola ${site.name}, envié la solicitud de cotización ${reference}:\n${detail}${extra}`,
  );
}

export function whatsappForCart(itemCount: number): string {
  return whatsappLink(
    `Hola ${site.name}, tengo ${itemCount} artículo(s) en mi carrito y necesito ayuda para completar la compra.`,
  );
}

export const telHref = `tel:${site.phoneHref}`;
export const mailHref = `mailto:${site.email}`;

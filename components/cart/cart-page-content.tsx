"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { QuantityInput } from "@/components/ui/quantity";
import { site } from "@/lib/data/site";
import { getBrandName } from "@/lib/services/catalog";
import { amountToFreeShipping } from "@/lib/services/pricing";
import { useCart } from "@/lib/store/cart-context";
import { useQuote } from "@/lib/store/quote-context";
import { formatCurrency } from "@/lib/utils/format";
import { whatsappForCart } from "@/lib/utils/whatsapp";

export function CartPageContent() {
  const {
    items,
    subtotal,
    count,
    totals,
    coupon,
    couponError,
    hydrated,
    setQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { count: quoteCount } = useQuote();
  const [code, setCode] = useState("");

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="h-72 animate-pulse rounded-xl bg-canvas" />
        <div className="h-72 animate-pulse rounded-xl bg-canvas" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-canvas px-6 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-muted shadow-card">
          <Icon name="cart" size={24} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Tu carrito está vacío</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
          Explora el catálogo y agrega los productos que necesitas. Si tu compra es por volumen,
          puedes armar una cotización empresarial.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <LinkButton href="/tienda">
            Explorar productos
            <Icon name="arrow-right" size={16} />
          </LinkButton>
          <LinkButton href="/cotizacion" variant="outline">
            <Icon name="quote" size={16} />
            Cotización empresarial {quoteCount > 0 ? `(${quoteCount})` : ""}
          </LinkButton>
        </div>
      </div>
    );
  }

  const missing = amountToFreeShipping(subtotal);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div>
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="hidden border-b border-line bg-canvas px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted sm:grid sm:grid-cols-[1fr_130px_120px_40px] sm:gap-4">
            <span>Producto</span>
            <span className="text-center">Cantidad</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.productId}
                className="grid gap-4 p-4 sm:grid-cols-[1fr_130px_120px_40px] sm:items-center sm:px-5"
              >
                <div className="flex gap-3.5">
                  <Link
                    href={`/producto/${item.slug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas"
                  >
                    <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                      {getBrandName(item.brand)}
                    </p>
                    <Link
                      href={`/producto/${item.slug}`}
                      className="line-clamp-2 text-[14.5px] font-medium leading-snug text-ink transition-colors hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-[12px] text-muted">SKU: {item.sku}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {formatCurrency(item.unitPrice)} c/u
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-center">
                  <span className="text-[13px] text-muted sm:hidden">Cantidad</span>
                  <QuantityInput
                    size="sm"
                    value={item.quantity}
                    onChange={(value) => setQuantity(item.productId, value)}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end">
                  <span className="text-[13px] text-muted sm:hidden">Total</span>
                  <span className="text-[15px] font-semibold text-ink">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <LinkButton href="/tienda" variant="outline" size="sm">
            <Icon name="arrow-left" size={15} />
            Continuar comprando
          </LinkButton>
          <a
            href={whatsappForCart(count)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#128C7E] hover:underline"
          >
            <Icon name="whatsapp" size={16} />
            ¿Necesitas ayuda con tu pedido?
          </a>
        </div>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16px] font-semibold text-ink">Resumen del pedido</h2>

          <dl className="mt-4 space-y-2.5 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal ({count} artículos)</dt>
              <dd className="font-medium text-ink">{formatCurrency(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between text-fresh-700">
                <dt>Descuento {coupon ? `(${coupon.code})` : ""}</dt>
                <dd className="font-medium">-{formatCurrency(totals.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted">ITBIS ({Math.round(site.taxRate * 100)} %)</dt>
              <dd className="font-medium text-ink">{formatCurrency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío estimado</dt>
              <dd className="font-medium text-ink">
                {totals.shipping === 0 ? "Gratis" : formatCurrency(totals.shipping)}
              </dd>
            </div>
          </dl>

          {missing > 0 ? (
            <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12.5px] text-muted">
              Agrega {formatCurrency(missing)} más y el envío estándar es gratis.
            </p>
          ) : null}

          <div className="mt-4 border-t border-line pt-4">
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-fresh-50 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fresh-700">
                  <Icon name="tag" size={15} />
                  {coupon.code}
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-[12.5px] font-medium text-fresh-700 underline-offset-2 hover:underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="cupon" className="text-[13px] font-medium text-ink">
                  ¿Tienes un cupón?
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="cupon"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="Código"
                    className="h-10 w-full rounded-lg border border-line px-3 text-[13px] uppercase focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 shrink-0"
                    onClick={() => {
                      if (applyCoupon(code)) setCode("");
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
                {couponError ? (
                  <p className="mt-1.5 text-[12px] text-red-600">{couponError}</p>
                ) : null}
              </>
            )}
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[15px] font-semibold text-ink">Total</span>
            <span className="text-xl font-semibold text-ink">{formatCurrency(totals.total)}</span>
          </div>

          <LinkButton href="/checkout" size="lg" fullWidth className="mt-4">
            Proceder al checkout
            <Icon name="arrow-right" size={17} />
          </LinkButton>

          <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
            <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-brand-600" />
            Los datos del pedido se confirman con un asesor antes del despacho.
          </p>
        </div>
      </aside>
    </div>
  );
}

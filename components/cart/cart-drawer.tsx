"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { QuantityInput } from "@/components/ui/quantity";
import { site } from "@/lib/data/site";
import { amountToFreeShipping } from "@/lib/services/pricing";
import { brandName } from "@/lib/data/catalog-meta";
import { useCart } from "@/lib/store/cart-context";
import { useUI } from "@/lib/store/ui-context";
import { formatCurrency } from "@/lib/utils/format";

/** Carrito lateral: acceso rápido sin abandonar la navegación. */
export function CartDrawer() {
  const { isOpen, closePanel } = useUI();
  const open = isOpen("cart");
  const { items, subtotal, count, setQuantity, removeItem } = useCart();

  if (!open) return null;

  const missing = amountToFreeShipping(subtotal);
  const progress = Math.min(100, (subtotal / site.freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Carrito de compra">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closePanel}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/45 animate-fade-in"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-pop">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Icon name="cart" size={19} className="text-brand-700" />
            Tu carrito
            {count > 0 ? <span className="text-muted">({count})</span> : null}
          </h2>
          <button
            type="button"
            onClick={closePanel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-slate-100 hover:text-ink"
            aria-label="Cerrar"
          >
            <Icon name="close" size={19} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-muted">
              <Icon name="cart" size={24} />
            </span>
            <p className="text-[15px] font-medium text-ink">Tu carrito está vacío</p>
            <p className="text-[13px] leading-relaxed text-muted">
              Explora el catálogo y agrega los productos que tu operación necesita.
            </p>
            <Link
              href="/tienda"
              onClick={closePanel}
              className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              Explorar productos
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        ) : (
          <>
            {missing > 0 ? (
              <div className="shrink-0 border-b border-line bg-canvas px-5 py-3">
                <p className="text-[12.5px] text-muted">
                  Te faltan <span className="font-semibold text-ink">{formatCurrency(missing)}</span> para
                  el envío gratis.
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="shrink-0 border-b border-line bg-fresh-50 px-5 py-2.5">
                <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fresh-700">
                  <Icon name="check-circle" size={15} />
                  Tu pedido califica para envío gratis.
                </p>
              </div>
            )}

            <ul className="flex-1 divide-y divide-line overflow-y-auto scroll-thin px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-4">
                  <Link
                    href={`/producto/${item.slug}`}
                    onClick={closePanel}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas"
                  >
                    <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                      {brandName(item.brand)}
                    </p>
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={closePanel}
                      className="line-clamp-2 text-[14px] font-medium leading-snug text-ink transition-colors hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-muted">{formatCurrency(item.unitPrice)} c/u</p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityInput
                        size="sm"
                        value={item.quantity}
                        onChange={(value) => setQuantity(item.productId, value)}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-ink">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="shrink-0 space-y-3 border-t border-line bg-white p-5">
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[12px] text-muted">
                Impuestos y envío se calculan en el checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closePanel}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-700 text-[15px] font-medium text-white transition-colors hover:bg-brand-800"
              >
                Proceder al checkout
                <Icon name="arrow-right" size={17} />
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/carrito"
                  onClick={closePanel}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-line text-[13px] font-medium text-ink transition-colors hover:border-brand-300"
                >
                  Ver carrito
                </Link>
                <button
                  type="button"
                  onClick={closePanel}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-line text-[13px] font-medium text-ink transition-colors hover:border-brand-300"
                >
                  Seguir comprando
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

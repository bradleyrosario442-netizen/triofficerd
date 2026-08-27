import { coupons } from "@/lib/data/coupons";
import { site } from "@/lib/data/site";
import type { CartItem, CartTotals, Coupon, DeliveryMethod } from "@/lib/types";

/** Reglas comerciales de precio. Aisladas de la UI para poder auditarlas. */

export function findCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return coupons.find((coupon) => coupon.code === normalized);
}

export function subtotalOf(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function discountOf(subtotal: number, coupon?: Coupon | null): number {
  if (!coupon || subtotal < coupon.minimum) return 0;
  const raw = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
  return Math.min(Math.round(raw), subtotal);
}

export function shippingOf(subtotal: number, method: DeliveryMethod = "delivery"): number {
  if (method === "pickup") return 0;
  if (subtotal <= 0) return 0;
  return subtotal >= site.freeShippingThreshold ? 0 : site.standardShipping;
}

export function calculateTotals(
  items: CartItem[],
  options: { coupon?: Coupon | null; deliveryMethod?: DeliveryMethod } = {},
): CartTotals {
  const subtotal = subtotalOf(items);
  const discount = discountOf(subtotal, options.coupon);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * site.taxRate);
  const shipping = shippingOf(subtotal, options.deliveryMethod ?? "delivery");
  return {
    subtotal,
    discount,
    tax,
    shipping,
    total: taxable + tax + shipping,
  };
}

export function discountPercent(price: number | null, previousPrice: number | null): number | null {
  if (!price || !previousPrice || previousPrice <= price) return null;
  return Math.round(((previousPrice - price) / previousPrice) * 100);
}

export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, site.freeShippingThreshold - subtotal);
}

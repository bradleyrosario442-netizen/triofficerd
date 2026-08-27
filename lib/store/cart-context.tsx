"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { calculateTotals, findCoupon } from "@/lib/services/pricing";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/store/persist";
import type { CartItem, CartTotals, Coupon, DeliveryMethod, Product } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  totals: CartTotals;
  coupon: Coupon | null;
  couponError: string | null;
  deliveryMethod: DeliveryMethod;
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage<CartItem[]>(STORAGE_KEYS.cart, []));
    const savedCode = readStorage<string | null>(STORAGE_KEYS.coupon, null);
    if (savedCode) setCoupon(findCoupon(savedCode) ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.cart, items);
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.coupon, coupon?.code ?? null);
  }, [coupon, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (product.quoteOnly || product.price === null) return;
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(999, item.quantity + quantity) }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          image: product.images[0],
          unitPrice: product.price as number,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.min(999, quantity) } : item,
          ),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponError(null);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items],
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const found = findCoupon(code);
      if (!found) {
        setCouponError("El cupón no es válido.");
        return false;
      }
      if (subtotal < found.minimum) {
        setCouponError(`Este cupón aplica en compras desde RD$${found.minimum.toLocaleString("es-DO")}.`);
        return false;
      }
      setCoupon(found);
      setCouponError(null);
      return true;
    },
    [subtotal],
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError(null);
  }, []);

  const totals = useMemo(
    () => calculateTotals(items, { coupon, deliveryMethod }),
    [items, coupon, deliveryMethod],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal,
      totals,
      coupon,
      couponError,
      deliveryMethod,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      clear,
      applyCoupon,
      removeCoupon,
      setDeliveryMethod,
    }),
    [
      items,
      subtotal,
      totals,
      coupon,
      couponError,
      deliveryMethod,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      clear,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return context;
}

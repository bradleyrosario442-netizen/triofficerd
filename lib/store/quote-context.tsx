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
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/store/persist";
import type { Product, QuoteItem } from "@/lib/types";

/**
 * Lista de cotización empresarial.
 * Es deliberadamente independiente del carrito: aquí no hay pago, hay una
 * solicitud que un asesor responde con precios por volumen.
 */
interface QuoteContextValue {
  items: QuoteItem[];
  count: number;
  referenceTotal: number;
  hasItems: boolean;
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  setNote: (productId: string, note: string) => void;
  clear: () => void;
  contains: (productId: string) => boolean;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage<QuoteItem[]>(STORAGE_KEYS.quote, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.quote, items);
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(9999, item.quantity + quantity) }
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
          referencePrice: product.price,
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
            item.productId === productId ? { ...item, quantity: Math.min(9999, quantity) } : item,
          ),
    );
  }, []);

  const setNote = useCallback((productId: string, note: string) => {
    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, note } : item)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const contains = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  );

  const value = useMemo<QuoteContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      referenceTotal: items.reduce(
        (total, item) => total + (item.referencePrice ?? 0) * item.quantity,
        0,
      ),
      hasItems: items.length > 0,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      setNote,
      clear,
      contains,
    }),
    [items, hydrated, addItem, removeItem, setQuantity, setNote, clear, contains],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote(): QuoteContextValue {
  const context = useContext(QuoteContext);
  if (!context) throw new Error("useQuote debe usarse dentro de <QuoteProvider>");
  return context;
}

"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/store/cart-context";
import { QuoteProvider } from "@/lib/store/quote-context";
import { UIProvider } from "@/lib/store/ui-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <CartProvider>
        <QuoteProvider>{children}</QuoteProvider>
      </CartProvider>
    </UIProvider>
  );
}

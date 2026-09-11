"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Piezas de la tienda —cabecera, pie, carrito, WhatsApp— que no aparecen en
 * el panel de administración, que tiene su propia barra.
 */
export function SiteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? null : children;
}

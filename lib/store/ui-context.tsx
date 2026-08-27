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
import { usePathname } from "next/navigation";

type Panel = "search" | "cart" | "nav" | null;

interface UIContextValue {
  panel: Panel;
  openPanel: (panel: Exclude<Panel, null>) => void;
  closePanel: () => void;
  isOpen: (panel: Exclude<Panel, null>) => boolean;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const pathname = usePathname();

  // Cerrar cualquier panel al navegar.
  useEffect(() => {
    setPanel(null);
  }, [pathname]);

  // Bloquear el scroll del documento mientras hay un panel abierto.
  useEffect(() => {
    const root = document.documentElement;
    if (panel) {
      const previous = root.style.overflow;
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = previous;
      };
    }
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  const openPanel = useCallback((next: Exclude<Panel, null>) => setPanel(next), []);
  const closePanel = useCallback(() => setPanel(null), []);
  const isOpen = useCallback((target: Exclude<Panel, null>) => panel === target, [panel]);

  const value = useMemo(() => ({ panel, openPanel, closePanel, isOpen }), [
    panel,
    openPanel,
    closePanel,
    isOpen,
  ]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI debe usarse dentro de <UIProvider>");
  return context;
}

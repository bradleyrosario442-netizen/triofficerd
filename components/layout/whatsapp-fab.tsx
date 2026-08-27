"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { whatsappGeneral } from "@/lib/utils/whatsapp";

/** Botón flotante de WhatsApp. Aparece tras un breve desplazamiento
 *  para no competir con el hero al entrar al sitio. */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappGeneral}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Tri Office por WhatsApp"
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#128C7E] px-4 py-3.5 text-sm font-medium text-white shadow-pop transition-all duration-300 hover:bg-[#0f7568] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <Icon name="whatsapp" size={22} />
      <span className="hidden sm:inline">Escríbenos</span>
    </a>
  );
}

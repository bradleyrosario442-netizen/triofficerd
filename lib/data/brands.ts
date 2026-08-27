import type { Brand } from "@/lib/types";

/**
 * Marcas configuradas en el sistema.
 *
 * `logo` apunta al archivo cargado desde administración. Mientras esté en `null`
 * la interfaz muestra un wordmark tipográfico: no se publica ningún logotipo ni
 * se declara ningún acuerdo comercial que no esté cargado explícitamente aquí.
 */
export const brands: Brand[] = [
  { slug: "hp", name: "HP", logo: null, categories: ["tecnologia", "impresion"] },
  { slug: "epson", name: "Epson", logo: null, categories: ["tecnologia", "impresion"] },
  { slug: "canon", name: "Canon", logo: null, categories: ["tecnologia", "impresion"] },
  { slug: "brother", name: "Brother", logo: null, categories: ["impresion", "tecnologia"] },
  { slug: "lenovo", name: "Lenovo", logo: null, categories: ["tecnologia"] },
  { slug: "dell", name: "Dell", logo: null, categories: ["tecnologia"] },
  { slug: "logitech", name: "Logitech", logo: null, categories: ["tecnologia"] },
  { slug: "tp-link", name: "TP-Link", logo: null, categories: ["tecnologia"] },
  { slug: "grandstream", name: "Grandstream", logo: null, categories: ["tecnologia"] },
  { slug: "casio", name: "Casio", logo: null, categories: ["tecnologia", "equipos-de-oficina"] },
  { slug: "fellowes", name: "Fellowes", logo: null, categories: ["equipos-de-oficina"] },
  { slug: "3m", name: "3M", logo: null, categories: ["materiales-de-oficina", "limpieza"] },
  { slug: "bic", name: "BIC", logo: null, categories: ["materiales-de-oficina", "escolares"] },
  { slug: "faber-castell", name: "Faber-Castell", logo: null, categories: ["escolares", "materiales-de-oficina"] },
  { slug: "norma", name: "Norma", logo: null, categories: ["escolares", "materiales-de-oficina"] },
  { slug: "scribe", name: "Scribe", logo: null, categories: ["materiales-de-oficina", "escolares"] },
  { slug: "clorox", name: "Clorox", logo: null, categories: ["limpieza"] },
  { slug: "mistolin", name: "Mistolin", logo: null, categories: ["limpieza"] },
  { slug: "officeline", name: "OfficeLine", logo: null, categories: ["mobiliario", "equipos-de-oficina"] },
  { slug: "ergoplus", name: "ErgoPlus", logo: null, categories: ["mobiliario"] },
];

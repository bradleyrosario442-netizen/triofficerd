/** Configuración institucional. Reemplazable por una tabla `settings` en Supabase. */
export const site = {
  name: "Tri Office",
  legalName: "Tri Office",
  tagline: "Soluciones para empresas, instituciones y hogares",
  description:
    "Tecnología, mobiliario, impresión, suministros y artículos de limpieza para mantener tu operación funcionando.",
  // El dominio se toma del entorno para que canónicas, sitemap y JSON-LD
  // apunten al sitio realmente desplegado. Netlify expone URL/DEPLOY_PRIME_URL.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    "https://www.trioffice.com",
  locale: "es-DO",
  currency: "DOP",
  currencySymbol: "RD$",
  taxRate: 0.18,
  freeShippingThreshold: 15000,
  standardShipping: 450,
  phone: "(809) 699-1669",
  phoneHref: "+18096991669",
  whatsapp: "18096991669",
  email: "ventas@trioffice.com",
  address: {
    street: "C/ Julio César Martínez #37",
    sector: "Alma Rosa I",
    city: "Santo Domingo Este",
    country: "República Dominicana",
  },
  hours: [
    { days: "Lunes a viernes", time: "8:00 a. m. – 6:00 p. m." },
    { days: "Sábados", time: "9:00 a. m. – 1:00 p. m." },
  ],
} as const;

export const addressLine = `${site.address.street}, ${site.address.sector}, ${site.address.city}, ${site.address.country}`;

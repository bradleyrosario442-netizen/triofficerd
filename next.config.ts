import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Política de seguridad de contenido.
 *
 * Se ajusta a lo que el sitio usa de verdad: todo es propio salvo las fuentes
 * de Google. No hay analítica, ni widgets, ni scripts de terceros, así que las
 * fuentes permitidas son pocas y concretas.
 *
 * Sobre `'unsafe-inline'` en `script-src`: el App Router entrega el árbol de
 * React en bloques `<script>` en línea. Bloquearlos rompe la hidratación
 * —comprobado en este proyecto—. Las dos salidas son un nonce por petición
 * desde un middleware, que obliga a renderizar todas las páginas bajo demanda
 * y costaría las 91 estáticas y su caché en la CDN, o admitir el inline. Se
 * elige lo segundo a conciencia:
 *
 *   - La vía real de XSS aquí era el JSON-LD, corregida en origen con escapado
 *     (`lib/utils/json-ld.ts`). React escapa el resto por defecto.
 *   - No hay contenido de usuario que se renderice como HTML.
 *   - Las demás directivas siguen cerrando vectores que `'unsafe-inline'` no
 *     toca: inyección de `<base>`, secuestro de formularios, plugins e iframes.
 *
 * Si más adelante se publica contenido de usuario, hay que pasar al nonce.
 */
const csp = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  // El botón de cotizar abre WhatsApp navegando, no por fetch.
  isProd ? "connect-src 'self'" : "connect-src 'self' ws: http: https:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

// HSTS solo en producción: en local el sitio corre sobre HTTP.
if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  images: {
    // Las ilustraciones del catálogo son SVG generados localmente. Se sirven
    // con CSP propia, sin ejecución de scripts y forzando descarga, que es la
    // mitigación recomendada cuando se habilita SVG.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/webp"],
    // Preparado para servir imágenes desde Supabase Storage:
    // remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },

  // No anunciar el framework ni su versión.
  poweredByHeader: false,
  compress: true,

  // Los mapas de fuente exponen el código original; fuera de producción.
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // La búsqueda es pública pero su respuesta depende de la consulta:
        // no debe quedar en cachés compartidas ni indexarse.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;

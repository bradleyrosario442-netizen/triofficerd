import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes de catálogo son SVG generados localmente en /public/img.
    // Se sirven con CSP restrictiva y sin ejecución de scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/webp"],
    // Preparado para servir imágenes desde Supabase Storage:
    // remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;

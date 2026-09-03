import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SideDock } from "@/components/layout/side-dock";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { Providers } from "@/components/providers";
import { SearchDialog } from "@/components/search/search-dialog";
import { site } from "@/lib/data/site";
import "./globals.css";
import { jsonLd } from "@/lib/utils/json-ld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "suministros de oficina",
    "tecnología empresarial",
    "mobiliario de oficina",
    "impresión",
    "equipos de oficina",
    "útiles escolares",
    "República Dominicana",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#174385",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.street}, ${site.address.sector}`,
    addressLocality: site.address.city,
    addressCountry: "DO",
  },
  areaServed: "República Dominicana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-DO" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
        />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Saltar al contenido
        </a>

        <Providers>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />

          <SearchDialog />
          <CartDrawer />
          <MobileNav />
          <SideDock />
          <WhatsAppFab />
        </Providers>

      </body>
    </html>
  );
}

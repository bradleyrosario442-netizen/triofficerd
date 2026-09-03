import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { addressLine, site } from "@/lib/data/site";
import { mailHref, telHref, whatsappGeneral } from "@/lib/utils/whatsapp";
import { jsonLd } from "@/lib/utils/json-ld";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Contacta a Tri Office: ${site.phone} · ${site.email} · ${site.address.street}, ${site.address.sector}, ${site.address.city}.`,
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    telephone: site.phone,
    email: site.email,
    url: `${site.url}/contacto`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.street}, ${site.address.sector}`,
      addressLocality: site.address.city,
      addressCountry: "DO",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessJsonLd) }}
      />

      <div className="border-b border-line bg-canvas">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Contacto" }]} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-[36px]">
            Contacto
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Escríbenos, llámanos o visítanos. Atendemos consultas de productos, cotizaciones
            empresariales y seguimiento de pedidos.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              href={telHref}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              <Icon name="phone" size={17} />
              Llamar
            </a>
            <a
              href={whatsappGeneral}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#128C7E] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0f7568]"
            >
              <Icon name="whatsapp" size={17} />
              WhatsApp
            </a>
            <a
              href={mailHref}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-brand-300"
            >
              <Icon name="mail" size={17} />
              Enviar correo
            </a>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          <ContactForm />

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-[15px] font-semibold text-ink">Datos de contacto</h2>
              <ul className="mt-4 space-y-4 text-[14px]">
                <li className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name="map-pin" size={17} />
                  </span>
                  <span>
                    <span className="block text-[12px] text-muted">Dirección</span>
                    <span className="text-ink">{addressLine}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name="phone" size={17} />
                  </span>
                  <span>
                    <span className="block text-[12px] text-muted">Teléfono</span>
                    <a href={telHref} className="text-ink hover:text-brand-700">
                      {site.phone}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name="mail" size={17} />
                  </span>
                  <span>
                    <span className="block text-[12px] text-muted">Correo</span>
                    <a href={mailHref} className="text-ink hover:text-brand-700">
                      {site.email}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name="clock" size={17} />
                  </span>
                  <span>
                    <span className="block text-[12px] text-muted">Horario</span>
                    {site.hours.map((entry) => (
                      <span key={entry.days} className="block text-ink">
                        {entry.days}: {entry.time}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
            </div>

            {/* Espacio preparado para el mapa incrustado */}
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <div
                className="relative flex h-56 items-center justify-center bg-canvas"
                role="img"
                aria-label="Espacio reservado para el mapa de ubicación"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgb(15 23 42 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(15 23 42 / 0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="relative text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-700 shadow-card">
                    <Icon name="map-pin" size={20} />
                  </span>
                  <p className="mt-3 text-[13px] font-medium text-ink">Alma Rosa I, Santo Domingo Este</p>
                  <p className="mt-1 text-[12px] text-muted">
                    Espacio reservado para el mapa incrustado
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

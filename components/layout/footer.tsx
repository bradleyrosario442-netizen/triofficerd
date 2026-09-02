import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { addressLine, site } from "@/lib/data/site";
import { mailHref, telHref, whatsappGeneral } from "@/lib/utils/whatsapp";

const columns = [
  {
    title: "Catálogo",
    links: [
      { href: "/categoria/tecnologia", label: "Tecnología" },
      { href: "/categoria/impresion", label: "Impresión" },
      { href: "/categoria/equipos-de-oficina", label: "Equipos de oficina" },
      { href: "/categoria/mobiliario", label: "Mobiliario" },
      { href: "/categoria/escolares", label: "Escolares" },
      { href: "/tienda", label: "Ver todo el catálogo" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/empresas", label: "Soluciones para empresas" },
      { href: "/marcas", label: "Marcas" },
      { href: "/tienda", label: "Catálogo" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/ayuda/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/ayuda/envios", label: "Envíos" },
      { href: "/ayuda/garantia", label: "Garantía" },
      { href: "/cotizacion", label: "Mi cotización" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-brand-950 text-brand-100">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.2fr]">
          <div>
            <Logo tone="dark" />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-brand-100/75">
              Proveedor de tecnología, impresión, equipos de oficina, mobiliario y artículos
              escolares para empresas, instituciones y hogares en República Dominicana.
            </p>
            <div className="mt-5 flex gap-2">
              {(["facebook", "instagram", "linkedin"] as const).map((network) => (
                <a
                  key={network}
                  href="#"
                  aria-label={`Tri Office en ${network}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-brand-100 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Icon name={network} size={17} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-brand-100/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Contacto</h3>
            <ul className="mt-4 space-y-3 text-[13.5px]">
              <li>
                <a href={telHref} className="flex items-start gap-2.5 text-brand-100/75 transition-colors hover:text-white">
                  <Icon name="phone" size={16} className="mt-0.5 shrink-0" />
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={mailHref} className="flex items-start gap-2.5 text-brand-100/75 transition-colors hover:text-white">
                  <Icon name="mail" size={16} className="mt-0.5 shrink-0" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-brand-100/75">
                <Icon name="map-pin" size={16} className="mt-0.5 shrink-0" />
                <span>{addressLine}</span>
              </li>
              <li>
                <a
                  href={whatsappGeneral}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex h-10 items-center gap-2 rounded-lg bg-white/10 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
                >
                  <Icon name="whatsapp" size={16} />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-[12.5px] text-brand-100/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/legal/privacidad" className="transition-colors hover:text-white">
              Política de privacidad
            </Link>
            <Link href="/legal/terminos" className="transition-colors hover:text-white">
              Términos y condiciones
            </Link>
            <Link href="/contacto" className="transition-colors hover:text-white">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

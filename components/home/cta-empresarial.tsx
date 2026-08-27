import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/data/site";
import { mailHref, telHref, whatsappGeneral } from "@/lib/utils/whatsapp";

export function CtaEmpresarial() {
  return (
    <section className="border-t border-line bg-white">
      <Container className="py-12">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-[28px]">
              Envíanos tu lista y te cotizamos.
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-muted">
              <a href={telHref} className="inline-flex items-center gap-2 hover:text-brand-700">
                <Icon name="phone" size={16} className="text-brand-600" />
                {site.phone}
              </a>
              <a href={mailHref} className="inline-flex items-center gap-2 hover:text-brand-700">
                <Icon name="mail" size={16} className="text-brand-600" />
                {site.email}
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <LinkButton href="/cotizacion" size="lg">
              <Icon name="quote" size={17} />
              Solicitar cotización
            </LinkButton>
            <LinkButton
              href={whatsappGeneral}
              variant="whatsapp"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={17} />
              WhatsApp
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}

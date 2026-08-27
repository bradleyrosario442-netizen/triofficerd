import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

export interface DocSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

/** Plantilla para páginas de texto: ayuda, envíos, garantía y legales. */
export function DocPage({
  title,
  intro,
  crumbs,
  sections,
  updatedAt,
}: {
  title: string;
  intro: string;
  crumbs: Crumb[];
  sections: DocSection[];
  updatedAt?: string;
}) {
  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-ink sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>
          {updatedAt ? (
            <p className="mt-3 text-[12.5px] text-muted">Última actualización: {updatedAt}</p>
          ) : null}
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-14">
          <article className="max-w-3xl">
            {sections.map((section) => (
              <section key={section.heading} className="mb-8 last:mb-0">
                <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2.5 text-[14.5px] leading-relaxed text-muted"
                      >
                        <Icon name="check" size={16} className="mt-1 shrink-0 text-brand-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-xl border border-line bg-canvas p-5">
              <h2 className="text-[14px] font-semibold text-ink">¿Necesitas ayuda?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Nuestro equipo comercial responde consultas sobre productos, pedidos y cotizaciones.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 text-[13px] font-medium text-white transition-colors hover:bg-brand-800"
              >
                Ir a contacto
                <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { categories } from "@/lib/data/categories";

export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-display text-[64px] font-semibold leading-none text-brand-100">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
          No encontramos esta página
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Es posible que el enlace haya cambiado o que el producto ya no esté publicado. Puedes
          volver al inicio o buscar en el catálogo.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <LinkButton href="/">Volver al inicio</LinkButton>
          <LinkButton href="/tienda" variant="outline">
            Ir a la tienda
            <Icon name="arrow-right" size={16} />
          </LinkButton>
        </div>

        <div className="mt-10 border-t border-line pt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            Categorías principales
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categoria/${category.slug}`}
                  className="inline-flex items-center rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}

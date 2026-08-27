import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import type { Category } from "@/lib/types";

/**
 * Acceso a las siete líneas en una sola fila: navegación sin bloque de texto.
 */
export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="bg-mist">
      <Container>
        <ul className="flex gap-2 overflow-x-auto py-6 hide-scrollbar">
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <Link
                href={`/categoria/${category.slug}`}
                className="group flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[13.5px] font-medium text-ink transition-colors hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-800"
              >
                <Icon name={category.icon} size={16} className="text-brand-600" />
                {category.name}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <Link
              href="/tienda"
              className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-brand-800"
            >
              Ver todo
              <Icon name="arrow-right" size={14} />
            </Link>
          </li>
        </ul>
      </Container>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";

/**
 * Marcas configuradas en el sistema.
 * Si la marca no tiene logotipo cargado se muestra su nombre en texto:
 * no se publica ninguna imagen ni acuerdo que no esté registrado en el catálogo.
 */
export function BrandsStrip({ brands }: { brands: Brand[] }) {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {brands.map((brand) => (
        <li key={brand.slug}>
          <Link
            href={`/tienda?marca=${brand.slug}`}
            className="flex h-24 items-center justify-center bg-white px-4 transition-colors hover:bg-canvas"
            aria-label={`Ver productos de ${brand.name}`}
          >
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={120}
                height={40}
                className="max-h-10 w-auto object-contain opacity-75 transition-opacity hover:opacity-100"
              />
            ) : (
              <span className="font-display text-[17px] font-semibold tracking-tight text-slate-400 transition-colors hover:text-brand-700">
                {brand.name}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/format";

/**
 * Logotipo Tri Office a partir del archivo original.
 * El isotipo y el logotipo tipográfico viven separados en `public/img/` para
 * poder componer la marca en horizontal, que es lo que pide una barra superior.
 * Sobre fondo oscuro se usa la variante con "OFFICE" en blanco.
 */
export function Logo({
  className,
  tone = "light",
  href = "/",
  showTagline = false,
}: {
  className?: string;
  tone?: "light" | "dark";
  href?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Tri Office — Inicio"
    >
      <Image
        src="/img/logo-mark.svg"
        alt=""
        width={40}
        height={35}
        priority
        className="h-9 w-auto"
      />
      <span className="flex flex-col">
        <Image
          src={tone === "dark" ? "/img/logo-wordmark-light.svg" : "/img/logo-wordmark.svg"}
          alt="Tri Office"
          width={678}
          height={102}
          priority
          className="h-[19px] w-auto"
        />
        {showTagline ? (
          <span
            className={cn(
              "mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em]",
              tone === "dark" ? "text-brand-200/80" : "text-muted",
            )}
          >
            Soluciones empresariales
          </span>
        ) : null}
      </span>
    </Link>
  );
}

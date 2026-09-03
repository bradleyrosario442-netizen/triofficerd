"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

/**
 * Página de error.
 *
 * Muestra un mensaje genérico. Next ya oculta el detalle en producción, pero
 * fijar la pantalla aquí evita que un cambio futuro lo exponga y da un lugar
 * donde enviar el error a un servicio de registro.
 *
 * `digest` es el identificador que Next asigna al error del servidor; sirve
 * para cruzarlo con el registro sin revelar nada de la excepción.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí iría el envío a Sentry o similar. La consola del servidor ya
    // registra la traza completa; el navegador solo ve el identificador.
    console.error("Error de aplicación", error.digest ?? "sin identificador");
  }, [error]);

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-muted">
          <Icon name="info" size={26} />
        </span>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink sm:text-[30px]">
          Algo no cargó como esperábamos
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Puedes intentarlo de nuevo o volver al catálogo. Si el problema
          persiste, escríbenos y lo revisamos.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-800"
          >
            <Icon name="refresh" size={17} />
            Reintentar
          </button>
          <LinkButton href="/tienda" variant="outline" size="lg">
            Ir al catálogo
          </LinkButton>
        </div>

        {error.digest ? (
          <p className="mt-8 text-[12px] text-slate-400">Referencia: {error.digest}</p>
        ) : null}
      </div>
    </Container>
  );
}

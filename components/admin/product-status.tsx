"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/admin/requests";
import { Button } from "@/components/ui/button";

interface ProductStatusProps {
  productId: string;
  origin: "base" | "nuevo";
  hidden: boolean;
  edited: boolean;
}

/** Publicar, retirar o revertir un producto. */
export function ProductStatus({ productId, origin, hidden, edited }: ProductStatusProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(method: string, body: unknown, question: string, done: () => void) {
    if (!window.confirm(question)) return;
    setBusy(true);
    setError("");
    const { ok, data } = await api(`/api/admin/productos/${productId}`, method, body);
    setBusy(false);
    if (!ok) {
      setError(data.error ?? "No se pudo completar.");
      return;
    }
    done();
  }

  return (
    <div>
      <p className="text-[13px] leading-relaxed text-muted">
        {hidden ? "Retirado del sitio. " : "Publicado en el sitio. "}
        {origin === "nuevo"
          ? "Creado desde el panel."
          : edited
            ? "Tiene cambios sobre los datos importados."
            : "Con los datos importados."}
      </p>

      <div className="mt-4 flex flex-col items-start gap-2">
        {hidden ? (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              run("POST", { accion: "restaurar" }, "¿Volver a publicar este producto?", () =>
                router.refresh(),
              )
            }
          >
            Restaurar en el sitio
          </Button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(
                "DELETE",
                undefined,
                origin === "nuevo"
                  ? "Se borrará definitivamente, junto con sus fotos. ¿Continuar?"
                  : "Se retirará del sitio. Podrás restaurarlo desde Productos → Eliminados. ¿Continuar?",
                () => {
                  router.push(origin === "nuevo" ? "/admin/productos" : `/admin/productos/${productId}`);
                  router.refresh();
                },
              )
            }
            className="inline-flex h-9 items-center rounded-lg border border-accent-200 px-3.5 text-[13px] font-medium text-accent-700 transition-colors hover:bg-accent-50 disabled:opacity-55"
          >
            Eliminar producto
          </button>
        )}

        {origin === "base" && edited ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() =>
              run(
                "POST",
                { accion: "revertir" },
                "Se descartan los cambios de nombre, marca, número de parte, categoría, descripción y destacado. Las fotos se mantienen. ¿Continuar?",
                () => router.refresh(),
              )
            }
          >
            Revertir a los datos importados
          </Button>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-[12.5px] text-red-600">{error}</p> : null}
    </div>
  );
}

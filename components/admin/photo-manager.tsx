"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ComponentProps } from "react";
import { isImageFile } from "@/components/admin/image-variants";
import { api, publishChanges, uploadPhoto } from "@/components/admin/requests";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

type IconName = ComponentProps<typeof Icon>["name"];

interface PhotoManagerProps {
  productId: string;
  initialPhotos: string[];
  /** Fotos cargadas en el repositorio (`public/img/fotos`), si las hay. */
  repositoryImages: string[];
  max: number;
}

export function PhotoManager({ productId, initialPhotos, repositoryImages, max }: PhotoManagerProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  async function upload(files: File[]) {
    const images = files.filter(isImageFile);
    const room = max - photos.length;
    const batch = images.slice(0, Math.max(0, room));
    const found: string[] = [];
    if (images.length < files.length) {
      found.push(`${files.length - images.length} archivo(s) no son JPG, PNG o WebP.`);
    }
    if (images.length > batch.length) {
      found.push(`Cada producto admite ${max} fotos: se omitieron ${images.length - batch.length}.`);
    }

    let changed = false;
    for (const [index, file] of batch.entries()) {
      setBusy(`Optimizando y subiendo ${index + 1} de ${batch.length}…`);
      const result = await uploadPhoto(productId, file, { defer: true });
      if (result.unauthorized) {
        window.location.assign("/admin/login");
        return;
      }
      if (!result.ok) {
        found.push(`${file.name}: ${result.error}`);
        continue;
      }
      if (result.fotos) setPhotos(result.fotos);
      changed = true;
    }

    if (changed) {
      await publishChanges();
      router.refresh();
    }
    setProblems(found);
    setBusy(null);
  }

  async function reorder(next: string[]) {
    setBusy("Guardando el orden…");
    const { ok, data } = await api("/api/admin/fotos", "PUT", { id: productId, orden: next });
    if (ok && data.fotos) {
      setPhotos(data.fotos);
      router.refresh();
    }
    setProblems(ok ? [] : [data.error ?? "No se pudo cambiar el orden."]);
    setBusy(null);
  }

  function move(index: number, target: number) {
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    void reorder(next);
  }

  async function remove(file: string) {
    if (!window.confirm("¿Eliminar esta foto? No se puede deshacer.")) return;
    setBusy("Eliminando…");
    const { ok, data } = await api("/api/admin/fotos", "DELETE", { id: productId, archivo: file });
    if (ok && data.fotos) {
      setPhotos(data.fotos);
      router.refresh();
    }
    setProblems(ok ? [] : [data.error ?? "No se pudo eliminar."]);
    setBusy(null);
  }

  const full = photos.length >= max;

  return (
    <div>
      {photos.length === 0 && repositoryImages.length > 0 ? (
        <p className="mb-3 rounded-lg bg-canvas px-3 py-2 text-[12.5px] leading-relaxed text-muted">
          Ahora muestra {repositoryImages.length} foto(s) cargada(s) en el repositorio. Las que subas
          aquí las reemplazan en el sitio.
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2.5">
          {photos.map((file, index) => (
            <li key={file}>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-canvas">
                {/* Ya viene optimizada: se muestra tal cual. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/fotos/sm/${productId}/${file}`}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Portada
                  </span>
                ) : null}
              </div>
              <div className="mt-1 flex justify-center">
                <PhotoButton
                  label="Mover a la izquierda"
                  icon="arrow-left"
                  disabled={index === 0 || Boolean(busy)}
                  onClick={() => move(index, index - 1)}
                />
                <PhotoButton
                  label="Usar como portada"
                  icon="star"
                  disabled={index === 0 || Boolean(busy)}
                  onClick={() => move(index, 0)}
                />
                <PhotoButton
                  label="Mover a la derecha"
                  icon="arrow-right"
                  disabled={index === photos.length - 1 || Boolean(busy)}
                  onClick={() => move(index, index + 1)}
                />
                <PhotoButton
                  label="Eliminar foto"
                  icon="trash"
                  danger
                  disabled={Boolean(busy)}
                  onClick={() => remove(file)}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        disabled={Boolean(busy) || full}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!busy && !full) void upload([...event.dataTransfer.files]);
        }}
        className={cn(
          "mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          dragging ? "border-brand-400 bg-brand-50" : "border-line hover:border-brand-300 hover:bg-canvas",
        )}
      >
        <Icon name="plus" size={20} className="text-brand-700" />
        <span className="text-[13.5px] font-medium text-ink">
          {full ? `Máximo ${max} fotos` : "Agregar fotos"}
        </span>
        <span className="text-[12px] text-muted">
          Arrastra aquí o haz clic. JPG, PNG o WebP; se optimizan antes de subir.
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void upload(files);
        }}
      />

      {busy ? (
        <p role="status" className="mt-3 text-[13px] text-brand-700">
          {busy}
        </p>
      ) : null}
      {problems.length > 0 ? (
        <ul className="mt-3 space-y-1 text-[12.5px] text-red-600">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PhotoButton({
  label,
  icon,
  danger,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconName;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30",
        danger ? "text-muted hover:bg-accent-50 hover:text-accent-700" : "text-muted hover:bg-canvas hover:text-ink",
      )}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

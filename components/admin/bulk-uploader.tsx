"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { isImageFile } from "@/components/admin/image-variants";
import { api, publishChanges, uploadPhoto } from "@/components/admin/requests";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/format";

interface Match {
  nombre: string;
  id: string | null;
  orden: number;
  producto?: string;
  /** Fotos que ya tiene el producto. */
  fotos?: number;
}

interface Entry {
  file: File;
  match: Match;
}

type Phase = "idle" | "resolving" | "ready" | "uploading" | "done";

/** Nombres por consulta al emparejador. */
const CHUNK = 500;
/** Productos que se suben a la vez; las fotos de un mismo producto van en orden. */
const WORKERS = 2;
/** Cada cuántas fotos se publica lo subido, para que el sitio avance con la carga. */
const PUBLISH_EVERY = 40;

const folderProps = { webkitdirectory: "", directory: "" } as Record<string, string>;

/** Archivos soltados, incluidos los de carpetas y subcarpetas. */
async function droppedFiles(event: DragEvent): Promise<File[]> {
  // Las entradas se leen antes de cualquier espera: después dejan de estar disponibles.
  const entries = [...event.dataTransfer.items]
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => Boolean(entry));
  if (entries.length === 0) return [...event.dataTransfer.files];

  const files: File[] = [];
  async function walk(entry: FileSystemEntry): Promise<void> {
    if (entry.isFile) {
      files.push(
        await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject)),
      );
      return;
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      for (;;) {
        const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
          reader.readEntries(resolve, reject),
        );
        if (batch.length === 0) break;
        for (const child of batch) await walk(child);
      }
    }
  }
  for (const entry of entries) await walk(entry);
  return files;
}

export function BulkUploader({ max }: { max: number }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ignored, setIgnored] = useState(0);
  const [replace, setReplace] = useState(true);
  const [progress, setProgress] = useState({ done: 0, failed: 0, total: 0, current: "" });
  const [problems, setProblems] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const cancelled = useRef(false);
  const filesInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== "uploading") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const matched = entries.filter((entry) => entry.match.id);
  const unmatched = entries.filter((entry) => !entry.match.id);

  /** Fotos por producto, en el orden de su sufijo. */
  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
      if (!entry.match.id) continue;
      const list = map.get(entry.match.id) ?? [];
      list.push(entry);
      map.set(entry.match.id, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          a.match.orden - b.match.orden ||
          a.file.name.localeCompare(b.file.name, "es", { numeric: true }),
      );
    }
    return map;
  }, [entries]);

  const overLimit = [...groups.values()].filter(
    (list) => list.length + (replace ? 0 : (list[0].match.fotos ?? 0)) > max,
  ).length;

  async function prepare(files: File[]) {
    const images = files.filter(isImageFile);
    setIgnored(files.length - images.length);
    setProblems([]);
    if (images.length === 0) {
      setNotice("No se encontraron imágenes JPG, PNG o WebP.");
      return;
    }

    setNotice(null);
    setPhase("resolving");
    const matches: Match[] = [];
    for (let start = 0; start < images.length; start += CHUNK) {
      const { ok, data } = await api<{ resultados: Match[] }>("/api/admin/fotos/resolver", "POST", {
        nombres: images.slice(start, start + CHUNK).map((file) => file.name),
      });
      if (!ok) {
        setNotice(data.error ?? "No se pudieron revisar los nombres de los archivos.");
        setPhase("idle");
        return;
      }
      matches.push(...data.resultados);
    }
    setEntries(images.map((file, index) => ({ file, match: matches[index] })));
    setPhase("ready");
  }

  async function start() {
    cancelled.current = false;
    const queue = [...groups.entries()];
    const total = queue.reduce((sum, [, list]) => sum + list.length, 0);
    const found: string[] = [];
    let done = 0;
    let failed = 0;
    let sincePublish = 0;
    let expired = false;

    const report = (current: string) => {
      setProgress({ done, failed, total, current });
      setProblems([...found]);
    };

    setPhase("uploading");
    report("");

    async function worker() {
      while (queue.length > 0 && !cancelled.current && !expired) {
        const [id, list] = queue.shift()!;
        for (const [index, entry] of list.entries()) {
          if (cancelled.current || expired) return;
          report(entry.file.name);
          const result = await uploadPhoto(id, entry.file, {
            replace: replace && index === 0,
            defer: true,
          });
          if (result.unauthorized) {
            expired = true;
            found.push("La sesión expiró. Vuelve a entrar y sube las fotos que faltan.");
            return;
          }
          if (result.ok) done += 1;
          else {
            failed += 1;
            found.push(`${entry.file.name}: ${result.error}`);
          }
          sincePublish += 1;
          if (sincePublish >= PUBLISH_EVERY) {
            sincePublish = 0;
            void publishChanges();
          }
        }
      }
    }

    await Promise.all(Array.from({ length: WORKERS }, worker));
    await publishChanges();
    report("");
    setPhase("done");
  }

  function reset() {
    setEntries([]);
    setIgnored(0);
    setProblems([]);
    setNotice(null);
    setPhase("idle");
  }

  const pickers = (
    <>
      <input
        ref={filesInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void prepare(files);
        }}
      />
      <input
        ref={folderInput}
        type="file"
        multiple
        hidden
        {...folderProps}
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void prepare(files);
        }}
      />
    </>
  );

  if (phase === "idle" || phase === "resolving") {
    return (
      <div>
        {pickers}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={async (event) => {
            event.preventDefault();
            setDragging(false);
            if (phase === "idle") void prepare(await droppedFiles(event));
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
            dragging ? "border-brand-400 bg-brand-50" : "border-line bg-canvas",
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-700 shadow-card">
            <Icon name="plus" size={22} />
          </span>
          {phase === "resolving" ? (
            <p role="status" className="mt-4 text-[14px] font-medium text-ink">
              Revisando los nombres de los archivos…
            </p>
          ) : (
            <>
              <p className="mt-4 text-[15px] font-semibold text-ink">
                Arrastra aquí las fotos o una carpeta completa
              </p>
              <p className="mt-1 text-[13px] text-muted">JPG, PNG o WebP. Se optimizan antes de subir.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={() => filesInput.current?.click()}>
                  Elegir fotos
                </Button>
                <Button type="button" variant="outline" onClick={() => folderInput.current?.click()}>
                  Elegir carpeta
                </Button>
              </div>
            </>
          )}
        </div>
        {notice ? <p className="mt-3 text-[13px] text-red-600">{notice}</p> : null}
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-fresh-200 bg-fresh-50 p-4">
            <p className="font-display text-2xl font-semibold text-fresh-700">{matched.length}</p>
            <p className="text-[13px] text-fresh-700">
              foto(s) para {groups.size} producto(s)
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border p-4",
              unmatched.length ? "border-accent-200 bg-accent-50" : "border-line bg-canvas",
            )}
          >
            <p
              className={cn(
                "font-display text-2xl font-semibold",
                unmatched.length ? "text-accent-700" : "text-muted",
              )}
            >
              {unmatched.length}
            </p>
            <p className={cn("text-[13px]", unmatched.length ? "text-accent-700" : "text-muted")}>
              sin producto que coincida
            </p>
          </div>
        </div>

        {ignored > 0 ? (
          <p className="mt-3 text-[12.5px] text-muted">
            Se ignoraron {ignored} archivo(s) que no son imágenes.
          </p>
        ) : null}

        {unmatched.length > 0 ? (
          <details className="mt-4 rounded-xl border border-line p-3.5">
            <summary className="cursor-pointer text-[13px] font-medium text-ink">
              Ver los que no coinciden
            </summary>
            <p className="mt-2 text-[12.5px] text-muted">
              El nombre debe ser el número de parte o el id del producto. Renómbralos y vuelve a
              cargarlos.
            </p>
            <ul className="mt-2 max-h-48 space-y-0.5 overflow-y-auto font-mono text-[12px] text-muted">
              {unmatched.slice(0, 300).map((entry, index) => (
                <li key={`${entry.file.name}-${index}`}>{entry.file.name}</li>
              ))}
            </ul>
          </details>
        ) : null}

        {matched.length > 0 ? (
          <>
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="sticky top-0 bg-canvas text-[11.5px] uppercase tracking-[0.06em] text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Archivo</th>
                      <th className="px-3 py-2 font-semibold">Producto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {[...groups.values()].slice(0, 150).flatMap((list) =>
                      list.map((entry, index) => (
                        <tr key={`${entry.match.id}-${entry.file.name}`}>
                          <td className="px-3 py-2 font-mono text-muted">{entry.file.name}</td>
                          <td className="px-3 py-2 text-ink">
                            <span className="line-clamp-1">{entry.match.producto}</span>
                            {index === 0 ? (
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                                Portada
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
              <input
                type="checkbox"
                checked={replace}
                onChange={(event) => setReplace(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span>
                <span className="block text-[13.5px] font-medium text-ink">
                  Reemplazar las fotos que ya tengan esos productos
                </span>
                <span className="block text-[12.5px] text-muted">
                  Desmárcalo para añadir estas fotos a las existentes.
                </span>
              </span>
            </label>

            {overLimit > 0 ? (
              <p className="mt-3 text-[12.5px] text-accent-700">
                {overLimit} producto(s) pasarían de {max} fotos: las que sobren no se subirán.
              </p>
            ) : null}
          </>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" disabled={matched.length === 0} onClick={() => void start()}>
            <Icon name="send" size={16} />
            Subir {matched.length} foto(s)
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  const percent = progress.total ? Math.round(((progress.done + progress.failed) / progress.total) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[14px] font-medium text-ink">
          {phase === "uploading" ? "Subiendo fotos…" : "Carga terminada"}
        </p>
        <p className="text-[13px] tabular-nums text-muted">
          {progress.done + progress.failed} de {progress.total}
        </p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {phase === "uploading" && progress.current ? (
        <p className="mt-2 truncate font-mono text-[12px] text-muted">{progress.current}</p>
      ) : null}

      {phase === "uploading" ? (
        <>
          <p className="mt-4 text-[12.5px] text-muted">
            No cierres esta pestaña hasta que termine. Lo subido se va publicando cada {PUBLISH_EVERY} fotos.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              cancelled.current = true;
            }}
          >
            Detener
          </Button>
        </>
      ) : (
        <div className="mt-4">
          <p className="text-[14px] text-ink">
            <span className="font-semibold text-fresh-700">{progress.done} subida(s)</span>
            {progress.failed > 0 ? (
              <span className="text-accent-700"> · {progress.failed} con error</span>
            ) : null}
            . Ya están publicadas en el sitio.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Subir más fotos
            </Button>
            <Link
              href="/admin/productos?estado=con-foto"
              className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink hover:border-brand-300"
            >
              Ver productos con foto
            </Link>
          </div>
        </div>
      )}

      {problems.length > 0 ? (
        <ul className="mt-4 max-h-48 space-y-0.5 overflow-y-auto rounded-xl border border-accent-200 bg-accent-50 p-3 text-[12.5px] text-accent-700">
          {problems.map((problem, index) => (
            <li key={`${problem}-${index}`}>{problem}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

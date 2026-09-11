import type { Metadata } from "next";
import { AdminShell, Panel } from "@/components/admin/admin-shell";
import { BulkUploader } from "@/components/admin/bulk-uploader";
import { MAX_PHOTOS } from "@/lib/admin/photos";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Subir fotos" };

const examples = [
  { file: "7MD68A.jpg", meaning: "Foto del producto con número de parte 7MD68A." },
  { file: "7MD68A-1.jpg\n7MD68A-2.jpg", meaning: "Varias fotos del mismo producto. La -1 es la portada." },
  { file: "hp-7md68a.jpg", meaning: "También sirve el identificador que aparece en la dirección de la ficha." },
];

export default async function BulkPhotosPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="Subir fotos"
      description="Sube muchas fotos de una vez: el panel las empareja con los productos por el nombre del archivo."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <BulkUploader max={MAX_PHOTOS} />
        </Panel>

        <Panel title="Cómo nombrar los archivos">
          <dl className="space-y-3.5">
            {examples.map((example) => (
              <div key={example.file}>
                <dt className="whitespace-pre-line font-mono text-[12.5px] font-medium text-ink">
                  {example.file}
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-muted">{example.meaning}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
            <p>Mayúsculas, guiones y guiones bajos no importan. Puedes soltar una carpeta con subcarpetas.</p>
            <p>
              Cada foto se reduce a 1600 px y se convierte a WebP en tu navegador antes de subirla, así
              que no hace falta prepararlas.
            </p>
            <p>Usa la misma proporción en todas las fotos de un producto; cuadradas es lo más simple.</p>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}

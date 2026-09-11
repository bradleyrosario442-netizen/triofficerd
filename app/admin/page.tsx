import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell, Notice, Panel } from "@/components/admin/admin-shell";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { requireAdmin } from "@/lib/admin/session";
import { isIllustration } from "@/lib/data/products";
import { getAdminCatalog } from "@/lib/services/catalog";

// La plantilla de título del layout solo aplica a las rutas hijas, no a esta.
export const metadata: Metadata = { title: { absolute: "Resumen · Administración Tri Office" } };

export default async function AdminHomePage() {
  await requireAdmin();
  const { items, storageKind } = await getAdminCatalog();

  const published = items.filter((item) => !item.hidden);
  const withPhoto = published.filter((item) => !isIllustration(item.product.images[0])).length;
  const coverage = published.length ? Math.round((withPhoto / published.length) * 100) : 0;

  const stats = [
    { label: "Publicados", value: published.length, href: "/admin/productos" },
    { label: "Con foto", value: withPhoto, href: "/admin/productos?estado=con-foto" },
    { label: "Sin foto", value: published.length - withPhoto, href: "/admin/productos?estado=sin-foto" },
    { label: "Editados", value: items.filter((item) => item.edited).length, href: "/admin/productos?estado=editados" },
    {
      label: "Creados en el panel",
      value: items.filter((item) => item.origin === "nuevo").length,
      href: "/admin/productos?estado=nuevos",
    },
    {
      label: "Eliminados",
      value: items.filter((item) => item.hidden).length,
      href: "/admin/productos?estado=eliminados",
    },
  ];

  return (
    <AdminShell
      title="Resumen"
      description="Estado del catálogo publicado en el sitio."
      actions={
        <>
          <LinkButton href="/admin/fotos" variant="outline">
            <Icon name="plus" size={16} />
            Subir fotos
          </LinkButton>
          <LinkButton href="/admin/productos/nuevo">
            <Icon name="plus" size={16} />
            Nuevo producto
          </LinkButton>
        </>
      }
    >
      {storageKind === "local" ? (
        <Notice tone="warn">
          Modo de desarrollo: los cambios se guardan en la carpeta <code>.data</code> de este equipo
          y no llegan al sitio publicado.
        </Notice>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:border-brand-200 hover:shadow-lift"
          >
            <span className="flex items-center justify-between text-[13px] text-muted">
              {stat.label}
              <Icon
                name="chevron-right"
                size={15}
                className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
              />
            </span>
            <span className="mt-1 block font-display text-3xl font-semibold text-ink">
              {stat.value.toLocaleString("es-DO")}
            </span>
          </Link>
        ))}
      </div>

      <Panel
        className="mt-6"
        title="Fotografías"
        description={`${coverage} % del catálogo publicado tiene foto. El resto muestra la ilustración de su categoría.`}
      >
        <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-fresh-500" style={{ width: `${coverage}%` }} />
        </div>
        <ol className="mt-5 grid gap-3 text-[13.5px] leading-relaxed text-muted sm:grid-cols-3">
          <li className="rounded-xl bg-canvas p-4">
            <span className="block font-semibold text-ink">1. Nombra las fotos</span>
            Con el número de parte: <code className="font-mono text-ink">7MD68A.jpg</code>. Para
            varias, <code className="font-mono text-ink">7MD68A-1.jpg</code>,{" "}
            <code className="font-mono text-ink">-2</code>…
          </li>
          <li className="rounded-xl bg-canvas p-4">
            <span className="block font-semibold text-ink">2. Arrastra la carpeta</span>
            En <Link href="/admin/fotos" className="font-medium text-brand-700 hover:underline">Subir fotos</Link>.
            El panel empareja cada archivo con su producto y te muestra cuáles no coinciden.
          </li>
          <li className="rounded-xl bg-canvas p-4">
            <span className="block font-semibold text-ink">3. Listo</span>
            Se optimizan en tu navegador, se suben y se publican solas. No hace falta volver a
            desplegar.
          </li>
        </ol>
      </Panel>
    </AdminShell>
  );
}

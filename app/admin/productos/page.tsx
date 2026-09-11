import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { requireAdmin } from "@/lib/admin/session";
import { isIllustration } from "@/lib/data/products";
import { categories } from "@/lib/data/taxonomy";
import { getAdminCatalog, getSubcategory, normalize, type AdminProduct } from "@/lib/services/catalog";
import { cn } from "@/lib/utils/format";
import { imageSource } from "@/lib/utils/product-image";

export const metadata: Metadata = { title: "Productos" };

const PAGE_SIZE = 40;

const STATES = [
  { value: "", label: "Publicados" },
  { value: "sin-foto", label: "Sin foto" },
  { value: "con-foto", label: "Con foto" },
  { value: "editados", label: "Editados" },
  { value: "nuevos", label: "Creados en el panel" },
  { value: "destacados", label: "Destacados" },
  { value: "eliminados", label: "Eliminados" },
];

function matchesState(item: AdminProduct, state: string): boolean {
  if (state === "eliminados") return item.hidden;
  if (item.hidden) return false;
  switch (state) {
    case "sin-foto":
      return isIllustration(item.product.images[0]);
    case "con-foto":
      return !isIllustration(item.product.images[0]);
    case "editados":
      return item.edited;
    case "nuevos":
      return item.origin === "nuevo";
    case "destacados":
      return item.product.featured;
    default:
      return true;
  }
}

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = one(params.q).trim().slice(0, 80);
  const state = STATES.some((entry) => entry.value === one(params.estado)) ? one(params.estado) : "";
  const category = categories.some((entry) => entry.slug === one(params.categoria))
    ? one(params.categoria)
    : "";
  const page = Math.max(1, Number.parseInt(one(params.pagina), 10) || 1);

  const { items } = await getAdminCatalog();
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const list = items.filter((item) => {
    if (!matchesState(item, state)) return false;
    if (category && item.product.category !== category) return false;
    if (tokens.length === 0) return true;
    const haystack = normalize(
      `${item.product.name} ${item.input.brandName} ${item.input.sku} ${item.product.id}`,
    );
    return tokens.every((token) => haystack.includes(token));
  });
  // Los creados en el panel, primero: suelen ser los que se están trabajando.
  list.sort((a, b) => Number(b.origin === "nuevo") - Number(a.origin === "nuevo"));

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const href = (target: number) => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (state) search.set("estado", state);
    if (category) search.set("categoria", category);
    if (target > 1) search.set("pagina", String(target));
    const text = search.toString();
    return `/admin/productos${text ? `?${text}` : ""}`;
  };

  return (
    <AdminShell
      title="Productos"
      description={`${list.length.toLocaleString("es-DO")} resultado(s)`}
      actions={
        <LinkButton href="/admin/productos/nuevo">
          <Icon name="plus" size={16} />
          Nuevo producto
        </LinkButton>
      }
    >
      <form
        action="/admin/productos"
        className="mb-5 grid gap-2.5 rounded-2xl border border-line bg-white p-3 shadow-card md:grid-cols-[minmax(0,1fr)_190px_210px_auto]"
      >
        <Input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre, marca o número de parte"
          aria-label="Buscar"
        />
        <Select name="estado" defaultValue={state} aria-label="Estado">
          {STATES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </Select>
        <Select name="categoria" defaultValue={category} aria-label="Categoría">
          <option value="">Todas las categorías</option>
          {categories.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="dark">
          <Icon name="search" size={16} />
          Filtrar
        </Button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center text-[14px] text-muted">
          No hay productos con estos filtros.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead className="border-b border-line bg-canvas text-[11.5px] uppercase tracking-[0.06em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Número de parte</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Fotos</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((item) => {
                  const editHref = `/admin/productos/${item.product.id}`;
                  const hasRepositoryPhoto =
                    item.photos.length === 0 && !isIllustration(item.product.images[0]);
                  return (
                    <tr key={item.product.id} className={cn(item.hidden && "bg-accent-50/40")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
                            <Image
                              {...imageSource(item.product.images[0], "sm")}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0">
                            <Link
                              href={editHref}
                              className="line-clamp-2 font-medium text-ink hover:text-brand-700"
                            >
                              {item.product.name}
                            </Link>
                            <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                              {item.input.brandName}
                              {item.origin === "nuevo" ? <Badge tone="fresh">Nuevo</Badge> : null}
                              {item.edited ? <Badge tone="brand">Editado</Badge> : null}
                              {item.product.featured ? <Badge tone="amber">Destacado</Badge> : null}
                              {item.hidden ? <Badge tone="accent">Eliminado</Badge> : null}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12.5px] text-muted">
                        {item.input.sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {getSubcategory(item.product.category, item.product.subcategory)?.name}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {item.photos.length > 0 ? (
                          <span className="text-ink">{item.photos.length}</span>
                        ) : hasRepositoryPhoto ? (
                          "Repositorio"
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={editHref}
                          className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 ? (
        <nav aria-label="Páginas" className="mt-5 flex items-center justify-between gap-3 text-[13px]">
          {current > 1 ? (
            <Link href={href(current - 1)} className="font-medium text-brand-700 hover:underline">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Página {current} de {pages}
          </span>
          {current < pages ? (
            <Link href={href(current + 1)} className="font-medium text-brand-700 hover:underline">
              Siguiente →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </AdminShell>
  );
}

function Badge({ tone, children }: { tone: "brand" | "fresh" | "accent" | "amber"; children: ReactNode }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    fresh: "bg-fresh-50 text-fresh-700",
    accent: "bg-accent-50 text-accent-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={cn("rounded px-1.5 py-px text-[10.5px] font-semibold uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

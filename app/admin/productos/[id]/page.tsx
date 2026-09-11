import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell, Notice, Panel } from "@/components/admin/admin-shell";
import { PhotoManager } from "@/components/admin/photo-manager";
import { ProductForm } from "@/components/admin/product-form";
import { ProductStatus } from "@/components/admin/product-status";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MAX_PHOTOS } from "@/lib/admin/photos";
import { requireAdmin } from "@/lib/admin/session";
import { isIllustration } from "@/lib/data/products";
import { getAdminCatalog, getCategory, getSubcategory } from "@/lib/services/catalog";

export const metadata: Metadata = { title: "Editar producto" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}

export default async function EditProductPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const { nuevo } = await searchParams;
  const { byId, brandNames } = await getAdminCatalog();
  const item = byId.get(id);
  if (!item) notFound();

  const { product } = item;
  const place =
    getSubcategory(product.category, product.subcategory)?.name ?? getCategory(product.category)?.name;

  return (
    <AdminShell
      title={product.name}
      description={[item.input.brandName, item.input.sku, place].filter(Boolean).join(" · ")}
      actions={
        <>
          <LinkButton href="/admin/productos" variant="outline">
            <Icon name="arrow-left" size={16} />
            Productos
          </LinkButton>
          {!item.hidden ? (
            <LinkButton
              href={`/producto/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              <Icon name="external" size={15} />
              Ver en el sitio
            </LinkButton>
          ) : null}
        </>
      }
    >
      {nuevo ? <Notice tone="ok">Producto creado y publicado. Ahora súbele fotos.</Notice> : null}
      {item.hidden ? (
        <Notice tone="warn">Este producto está retirado del sitio. Puedes restaurarlo abajo.</Notice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Datos del producto">
          <ProductForm
            mode="edit"
            productId={product.id}
            initial={item.input}
            original={item.original}
            brands={brandNames}
          />
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel
            title="Fotos"
            description={`Hasta ${MAX_PHOTOS}. La primera es la portada en el catálogo.`}
          >
            <PhotoManager
              productId={product.id}
              initialPhotos={item.photos}
              repositoryImages={
                item.photos.length ? [] : product.images.filter((src) => !isIllustration(src))
              }
              max={MAX_PHOTOS}
            />
          </Panel>

          <Panel title="Estado">
            <ProductStatus
              productId={product.id}
              origin={item.origin}
              hidden={item.hidden}
              edited={item.edited}
            />
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

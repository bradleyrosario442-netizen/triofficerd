import type { Metadata } from "next";
import { AdminShell, Panel } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { LinkButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { requireAdmin } from "@/lib/admin/session";
import { categories } from "@/lib/data/taxonomy";
import { getAdminCatalog } from "@/lib/services/catalog";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requireAdmin();
  const { brandNames } = await getAdminCatalog();
  const [first] = categories;

  return (
    <AdminShell
      title="Nuevo producto"
      description="Después de crearlo podrás subirle fotos."
      actions={
        <LinkButton href="/admin/productos" variant="outline">
          <Icon name="arrow-left" size={16} />
          Productos
        </LinkButton>
      }
    >
      <Panel className="max-w-3xl">
        <ProductForm
          mode="create"
          brands={brandNames}
          initial={{
            name: "",
            brandName: "",
            sku: "",
            category: first.slug,
            subcategory: first.subcategories[0]?.slug ?? "",
            description: "",
            featured: false,
          }}
        />
      </Panel>
    </AdminShell>
  );
}

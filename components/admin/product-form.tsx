"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api } from "@/components/admin/requests";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  LIMITS,
  parseProductInput,
  subcategoriesOf,
  type FieldErrors,
  type ProductInput,
} from "@/lib/admin/validation";
import { categories } from "@/lib/data/taxonomy";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initial: ProductInput;
  /** Datos del catálogo importado, para mostrar qué cambió. */
  original?: ProductInput | null;
  brands: string[];
}

export function ProductForm({ mode, productId, initial, original, brands }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Si el servidor cambia los datos (revertir, restaurar), el formulario los toma.
  const initialKey = JSON.stringify(initial);
  useEffect(() => {
    setValues(JSON.parse(initialKey) as ProductInput);
  }, [initialKey]);

  const dirty = JSON.stringify(values) !== initialKey;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus(null);
  }

  function setCategory(category: string) {
    setValues((current) => ({
      ...current,
      category,
      subcategory: subcategoriesOf(category)[0]?.slug ?? "",
    }));
    setErrors((current) => ({ ...current, category: undefined, subcategory: undefined }));
    setStatus(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { value, errors: found } = parseProductInput(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus({ tone: "error", text: "Revisa los campos marcados." });
      return;
    }

    setSaving(true);
    setStatus(null);
    const { ok, data } = await api(
      mode === "create" ? "/api/admin/productos" : `/api/admin/productos/${productId}`,
      mode === "create" ? "POST" : "PATCH",
      value,
    );
    setSaving(false);

    if (!ok) {
      setErrors(data.errors ?? {});
      setStatus({ tone: "error", text: data.error ?? "No se pudo guardar." });
      return;
    }
    if (mode === "create" && data.id) {
      router.push(`/admin/productos/${data.id}?nuevo=1`);
      return;
    }
    setValues(value);
    setStatus({ tone: "ok", text: "Guardado. El cambio ya está publicado en el sitio." });
    router.refresh();
  }

  /** Valor original de un campo, con un atajo para recuperarlo. */
  function originalOf(key: "name" | "brandName" | "sku", render?: (value: string) => ReactNode) {
    if (!original || values[key] === original[key]) return null;
    return (
      <p className="text-[12px] text-muted">
        Original: <span className="text-ink">{render ? render(original[key]) : original[key] || "—"}</span>
        {" · "}
        <button
          type="button"
          onClick={() => set(key, original[key])}
          className="font-medium text-brand-700 hover:underline"
        >
          Restaurar
        </button>
      </p>
    );
  }

  const subcategories = subcategoriesOf(values.category);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field label="Nombre" htmlFor="name" required error={errors.name}>
        <Input
          id="name"
          value={values.name}
          maxLength={LIMITS.name}
          onChange={(event) => set("name", event.target.value)}
        />
        {originalOf("name")}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Marca" htmlFor="brandName" required error={errors.brandName}>
          <Input
            id="brandName"
            list="admin-marcas"
            value={values.brandName}
            maxLength={LIMITS.brandName}
            onChange={(event) => set("brandName", event.target.value)}
          />
          <datalist id="admin-marcas">
            {brands.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
          {originalOf("brandName")}
        </Field>

        <Field
          label="Número de parte"
          htmlFor="sku"
          error={errors.sku}
          hint={errors.sku ? undefined : "El código del fabricante. Sirve para emparejar fotos."}
        >
          <Input
            id="sku"
            value={values.sku}
            maxLength={LIMITS.sku}
            onChange={(event) => set("sku", event.target.value)}
            className="font-mono"
          />
          {originalOf("sku")}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Categoría" htmlFor="category" required error={errors.category}>
          <Select
            id="category"
            value={values.category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Subcategoría" htmlFor="subcategory" required error={errors.subcategory}>
          <Select
            id="subcategory"
            value={values.subcategory}
            onChange={(event) => set("subcategory", event.target.value)}
          >
            {subcategories.map((subcategory) => (
              <option key={subcategory.slug} value={subcategory.slug}>
                {subcategory.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Descripción"
        htmlFor="description"
        error={errors.description}
        hint={
          errors.description
            ? undefined
            : `Texto propio de Tri Office. Se muestra en la ficha del producto. ${values.description.length}/${LIMITS.description}`
        }
      >
        <Textarea
          id="description"
          rows={7}
          value={values.description}
          maxLength={LIMITS.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(event) => set("featured", event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-700"
        />
        <span>
          <span className="block text-[13.5px] font-medium text-ink">Destacar en la portada</span>
          <span className="block text-[12.5px] text-muted">
            Aparece primero en el carrusel «Del catálogo» de la página de inicio.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={saving || (mode === "edit" && !dirty)}>
          {saving ? "Guardando…" : mode === "create" ? "Crear producto" : "Guardar cambios"}
        </Button>
        {mode === "edit" && dirty && !saving ? (
          <button
            type="button"
            onClick={() => {
              setValues(JSON.parse(initialKey) as ProductInput);
              setErrors({});
              setStatus(null);
            }}
            className="text-[13px] font-medium text-muted hover:text-ink"
          >
            Descartar cambios
          </button>
        ) : null}
        {status ? (
          <p
            role="status"
            className={status.tone === "ok" ? "text-[13px] text-fresh-700" : "text-[13px] text-red-600"}
          >
            {status.text}
          </p>
        ) : null}
      </div>
    </form>
  );
}

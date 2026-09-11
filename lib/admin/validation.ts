import { categories } from "@/lib/data/taxonomy";

/**
 * Validación de los datos de producto.
 *
 * La usan el formulario —para avisar antes de enviar— y el servidor, que es
 * quien decide: lo que valida el navegador se puede saltar.
 */

export const LIMITS = {
  name: 160,
  brandName: 60,
  sku: 40,
  description: 5000,
} as const;

export interface ProductInput {
  name: string;
  brandName: string;
  sku: string;
  category: string;
  subcategory: string;
  description: string;
  featured: boolean;
}

export type FieldErrors = Partial<Record<keyof ProductInput, string>>;

/** Caracteres de control: no tienen uso en un nombre ni en una descripción. */
const CONTROL = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

function singleLine(value: unknown): string {
  return typeof value === "string"
    ? value.normalize("NFC").replace(CONTROL, "").replace(/\s+/g, " ").trim()
    : "";
}

function multiLine(value: unknown): string {
  return typeof value === "string"
    ? value
        .normalize("NFC")
        .replace(/\r\n?/g, "\n")
        .replace(CONTROL, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : "";
}

/** Letras, números y los separadores que usan los fabricantes. Sin espacios. */
const SKU = /^[A-Za-z0-9][A-Za-z0-9._\-/#+]*$/;

export function subcategoriesOf(category: string) {
  return categories.find((entry) => entry.slug === category)?.subcategories ?? [];
}

export function parseProductInput(raw: unknown): { value: ProductInput; errors: FieldErrors } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const value: ProductInput = {
    name: singleLine(input.name),
    brandName: singleLine(input.brandName),
    sku: singleLine(input.sku),
    category: singleLine(input.category),
    subcategory: singleLine(input.subcategory),
    description: multiLine(input.description),
    featured: input.featured === true,
  };

  const errors: FieldErrors = {};
  if (value.name.length < 3) errors.name = "Escribe el nombre del producto.";
  else if (value.name.length > LIMITS.name) errors.name = `Máximo ${LIMITS.name} caracteres.`;

  if (!value.brandName) errors.brandName = "Indica la marca (o «Genérico»).";
  else if (value.brandName.length > LIMITS.brandName) {
    errors.brandName = `Máximo ${LIMITS.brandName} caracteres.`;
  }

  if (value.sku.length > LIMITS.sku) errors.sku = `Máximo ${LIMITS.sku} caracteres.`;
  else if (value.sku && !SKU.test(value.sku)) {
    errors.sku = "Solo letras, números y - . _ / # +, sin espacios.";
  }

  if (!categories.some((entry) => entry.slug === value.category)) {
    errors.category = "Elige una categoría.";
  } else if (!subcategoriesOf(value.category).some((entry) => entry.slug === value.subcategory)) {
    errors.subcategory = "Elige una subcategoría.";
  }

  if (value.description.length > LIMITS.description) {
    errors.description = `Máximo ${LIMITS.description} caracteres.`;
  }

  return { value, errors };
}

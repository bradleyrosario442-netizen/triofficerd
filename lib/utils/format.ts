import { site } from "@/lib/data/site";

const currencyFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: site.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("es-DO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** RD$1,250.00 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value).replace("DOP", "RD$").replace(/\s+/g, " ").trim();
}

/** 1,250 */
export function formatNumber(value: number): string {
  return compactFormatter.format(value);
}

/** RD$15,000 — para umbrales y mensajes promocionales, sin centavos. */
export function formatCurrencyShort(value: number): string {
  return `${site.currencySymbol}${compactFormatter.format(value)}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date(iso));
}

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

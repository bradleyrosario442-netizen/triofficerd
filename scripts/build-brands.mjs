/**
 * Genera data/brands.json a partir del catálogo.
 *
 * Existe para que los componentes de cliente puedan resolver el nombre de una
 * marca sin importar `lib/services/catalog.ts`, que arrastraría los 2.862
 * productos al bundle del navegador.
 *
 *   node scripts/build-brands.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const raw = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));

const EXACT = {
  generico: "Genérico",
  hp: "HP",
  "hp-refurbish": "HP Refurbish",
  msi: "MSI",
  aoc: "AOC",
  jbl: "JBL",
  "tp-link": "TP-Link",
  hikvision: "HIKVISION",
  hiksemi: "HIKSEMI",
  chargeworx: "CHARGEWORX",
  myo: "MYO",
  apc: "APC",
  lg: "LG",
  asus: "ASUS",
  aoc_: "AOC",
};

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const known = [...new Set(raw.map((p) => p.brand.trim()).filter((b) => b.length >= 3))].sort(
  (a, b) => b.length - a.length,
);

const names = {};
for (const product of raw) {
  const upper = product.name.toUpperCase();
  const brand =
    product.brand.trim() ||
    known.find((candidate) => upper.includes(candidate.toUpperCase())) ||
    "Genérico";
  const slug = slugify(brand);
  if (!names[slug]) names[slug] = EXACT[slug] ?? brand;
}

const sorted = Object.fromEntries(Object.entries(names).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(path.join(root, "data", "brand-names.json"), `${JSON.stringify(sorted, null, 1)}\n`);
console.log(`${Object.keys(sorted).length} marcas en data/brand-names.json`);

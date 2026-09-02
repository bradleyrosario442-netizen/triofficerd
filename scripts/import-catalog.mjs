/**
 * Importador del catálogo de referencia.
 *
 * Recoge ÚNICAMENTE datos de hecho: marca, nombre del producto, número de parte
 * del fabricante y categoría. No lee precios, descripciones, promociones,
 * inventario ni ningún texto comercial de la fuente: esos campos no tienen
 * expresión regular asociada, así que no pueden llegar al archivo de salida.
 *
 * Salida: data/products.json
 * Uso:    node scripts/import-catalog.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "https://tienda.omega.com.do";
const UA = "Mozilla/5.0 (compatible; TriOfficeCatalogImport/1.0)";
const OUT = path.join(process.cwd(), "data", "products.json");
const PAUSE = 320;

const decode = (s) =>
  s
    .replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    .replace(/&#193;/g, "Á").replace(/&#201;/g, "É").replace(/&#205;/g, "Í")
    .replace(/&#211;/g, "Ó").replace(/&#218;/g, "Ú").replace(/&#209;/g, "Ñ")
    .replace(/&#225;/g, "á").replace(/&#233;/g, "é").replace(/&#237;/g, "í")
    .replace(/&#243;/g, "ó").replace(/&#250;/g, "ú").replace(/&#241;/g, "ñ")
    .replace(/&#186;/g, "º").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function get(url, tries = 3) {
  for (let attempt = 0; attempt < tries; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) return res.text();
      if (res.status === 404) return null;
    } catch {
      /* reintenta */
    }
    await new Promise((r) => setTimeout(r, 900 * (attempt + 1)));
  }
  return null;
}

/** Tarjetas del listado: id de ficha + título "MARCA - NOMBRE". */
function parseCards(html) {
  const cards = [];
  for (const block of html.split(/<li[^>]*class="[^"]*\bproduct\b[^"]*"/i).slice(1)) {
    const id = block.match(/\/es\/product\/consul\/(\d+)/)?.[1];
    const title = block.match(/<h4>([^<]+)<\/h4>/)?.[1];
    if (id && title) cards.push({ id, title: decode(title) });
  }
  return cards;
}

console.log("1/3  Leyendo el índice de categorías…");
const home = await get(`${BASE}/`);
const cats = new Map();
for (const m of home.matchAll(/href="\/es\/category\/list\/(\d+)\?type=grid"[^>]*>\s*([^<]{2,60})/g)) {
  const name = decode(m[2]);
  if (name && !cats.has(m[1])) cats.set(m[1], name);
}
console.log(`     ${cats.size} categorías`);

console.log("2/3  Recorriendo listados…");
const found = new Map();
for (const [id, name] of cats) {
  const first = await get(`${BASE}/es/category/list/${id}?type=grid`);
  if (!first) continue;
  const pages = Math.max(1, ...[...first.matchAll(/page=(\d+)/g)].map((m) => Number(m[1])));

  for (let page = 1; page <= pages; page += 1) {
    const html = page === 1 ? first : await get(`${BASE}/es/category/list/${id}?page=${page}&type=grid`);
    if (!html) continue;
    for (const card of parseCards(html)) {
      if (!found.has(card.id)) found.set(card.id, { ...card, category: name });
    }
    if (page > 1) await new Promise((r) => setTimeout(r, PAUSE));
  }
  process.stdout.write(`     ${name.padEnd(34)} → ${found.size}\n`);
}
console.log(`     ${found.size} productos únicos`);

console.log("3/3  Leyendo número de parte de cada ficha…");
const products = [];
let done = 0;
let withPart = 0;

for (const item of found.values()) {
  const html = await get(`${BASE}/es/product/consul/${item.id}`);
  done += 1;

  let part = "";
  if (html) {
    part = decode(html.match(/N&#250;mero de parte\s*:?\s*<\/span>\s*([^<\n]{1,60})/)?.[1] ?? "");
    part = part.replace(/\s+CANAL$/i, "").trim();
  }
  if (part) withPart += 1;

  const cut = item.title.indexOf(" - ");
  const hasBrand = cut > 0 && cut < 34;

  products.push({
    brand: hasBrand ? item.title.slice(0, cut).trim() : "",
    name: hasBrand ? item.title.slice(cut + 3).trim() : item.title.trim(),
    model: part,
    sourceCategory: item.category,
  });

  if (done % 100 === 0) console.log(`     ${done}/${found.size}  (${withPart} con número de parte)`);
  await new Promise((r) => setTimeout(r, PAUSE));
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(products, null, 1)}\n`);
console.log(`\nListo: ${products.length} productos en data/products.json (${withPart} con número de parte)`);

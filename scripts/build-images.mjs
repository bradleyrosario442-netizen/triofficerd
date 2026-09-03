/**
 * Registra las fotografías disponibles y las asocia a cada producto.
 *
 * Basta con dejar los archivos en `public/img/fotos/`. El nombre puede ser:
 *
 *   7md68a.webp              → número de parte del fabricante
 *   hp-7md68a.webp           → identificador del producto (marca + parte)
 *   HP_7MD68A.jpg            → mayúsculas, guiones o guiones bajos, da igual
 *
 * El script normaliza el nombre, busca a qué producto corresponde y escribe
 * `data/product-images.json`. Lo que no encuentre pareja queda reportado, y los
 * productos sin foto siguen mostrando su ilustración.
 *
 * Para el collage del hero: los archivos van en `public/img/hero/fotos/`, con
 * fondo transparente, y se toman en orden alfabético.
 *
 *   node scripts/build-images.mjs
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const FOTOS = path.join(root, "public", "img", "fotos");
const HERO = path.join(root, "public", "img", "hero", "fotos");
const OUT = path.join(root, "data", "product-images.json");
const EXT = new Set([".webp", ".png", ".jpg", ".jpeg", ".avif"]);

/** Deja solo letras y números: "HP_7MD68A" y "hp-7md68a" son la misma llave. */
const key = (value) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

async function listImages(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && EXT.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

// ── Productos: se reconstruyen los mismos identificadores que usa el sitio ──
const raw = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));
const brandNames = JSON.parse(await readFile(path.join(root, "data", "brand-names.json"), "utf8"));
const slugsPorMarca = Object.keys(brandNames);

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const known = [...new Set(raw.map((p) => p.brand.trim()).filter((b) => b.length >= 3))].sort(
  (a, b) => b.length - a.length,
);

/** Índice: llave normalizada → id de producto. */
const index = new Map();
const usados = new Set();

raw.forEach((row, i) => {
  const upper = row.name.toUpperCase();
  const brand =
    row.brand.trim() || known.find((c) => upper.includes(c.toUpperCase())) || "Genérico";
  const model = row.model.trim();

  const base = slugify(`${brand} ${model || row.name}`) || `producto-${i}`;
  let id = base;
  let n = 2;
  while (usados.has(id)) id = `${base}-${n++}`;
  usados.add(id);

  // Se acepta tanto el id completo como el número de parte a secas.
  if (!index.has(key(id))) index.set(key(id), id);
  if (model && !index.has(key(model))) index.set(key(model), id);
});

// ── Emparejado ──
const archivos = await listImages(FOTOS);
const mapa = {};
const huerfanos = [];

for (const file of archivos) {
  const nombre = path.basename(file, path.extname(file));
  const id = index.get(key(nombre));
  if (id) mapa[id] = `/img/fotos/${file}`;
  else huerfanos.push(file);
}

const hero = (await listImages(HERO)).map((file) => `/img/hero/fotos/${file}`);

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ productos: mapa, hero }, null, 1)}\n`);

// ── Reporte ──
const total = raw.length;
const conFoto = Object.keys(mapa).length;
console.log(`Fotos de producto : ${conFoto} de ${total} (${((conFoto / total) * 100).toFixed(1)} %)`);
console.log(`Collage del hero  : ${hero.length} imagen(es)`);

if (huerfanos.length) {
  console.log(`\nSin producto que coincida (${huerfanos.length}):`);
  for (const file of huerfanos.slice(0, 20)) console.log(`  · ${file}`);
  if (huerfanos.length > 20) console.log(`  …y ${huerfanos.length - 20} más`);
  console.log("\nRevisa que el nombre sea el número de parte o el id del producto.");
}

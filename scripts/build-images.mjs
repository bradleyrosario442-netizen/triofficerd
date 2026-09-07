/**
 * Registra las fotografías disponibles y las asocia a cada producto.
 *
 * Basta con dejar los archivos en `public/img/fotos/`. El nombre puede ser:
 *
 *   7MD68A.webp              → número de parte del fabricante
 *   hp-7md68a.webp           → identificador del producto (marca + parte)
 *   HP_7MD68A.jpg            → mayúsculas, guiones o guiones bajos, da igual
 *
 * VARIAS FOTOS DEL MISMO PRODUCTO: se añade `-1`, `-2`, `-3` al final. La
 * primera es la que sale en las tarjetas del catálogo; las demás aparecen como
 * miniaturas en la ficha.
 *
 *   7MD68A-1.webp   → frontal (portada del producto)
 *   7MD68A-2.webp   → lateral
 *   7MD68A-3.webp   → detalle del panel
 *
 * El sufijo se distingue del número de parte porque primero se prueba el
 * nombre completo: "TL-SF1005D.webp" se resuelve como el switch TP-Link, y
 * "TL-SF1005D-2.webp" como su segunda foto.
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
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
}

// ── Productos: se reconstruyen los mismos identificadores que usa el sitio ──
const raw = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Misma validación que `lib/data/products.ts`, para que los ids coincidan. */
function manufacturerPart(code) {
  let value = code
    .replace(/\*+/g, "")
    .replace(/\s+CANAL\b/i, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim();

  if (value.includes("/")) {
    const first = value.split("/")[0].trim();
    if (/\d/.test(first) && first.length >= 6) value = first;
  }
  if (value.includes(" ")) {
    const first = value.split(/\s+/)[0];
    if (/\d/.test(first) && first.length >= 5) value = first;
  }

  const upper = value.toUpperCase();
  const rejected =
    !value ||
    /^(NYS|N&S|NS-|CNB-|CSI-|SYS-|R-LEN)/.test(upper) ||
    upper.includes("&") ||
    upper.endsWith("-") ||
    value.includes(" ") ||
    value.length > 24 ||
    (value.match(/-/g) ?? []).length >= 4;

  return rejected ? "" : value;
}

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
  const model = manufacturerPart(row.model);

  const base = slugify(`${brand} ${model || row.name}`) || `producto-${i}`;
  let id = base;
  let n = 2;
  while (usados.has(id)) id = `${base}-${n++}`;
  usados.add(id);

  if (!index.has(key(id))) index.set(key(id), id);
  if (model && !index.has(key(model))) index.set(key(model), id);
});

/**
 * Resuelve a qué producto pertenece un archivo y en qué posición va.
 * Primero se prueba el nombre completo; si no hay producto, se comprueba si
 * termina en `-N` y se reintenta sin ese sufijo.
 */
function resolver(nombre) {
  const directo = index.get(key(nombre));
  if (directo) return { id: directo, orden: 0 };

  const conSufijo = nombre.match(/^(.*)[-_](\d{1,2})$/);
  if (conSufijo) {
    const id = index.get(key(conSufijo[1]));
    if (id) return { id, orden: Number(conSufijo[2]) };
  }
  return null;
}

// ── Emparejado ──
const archivos = await listImages(FOTOS);
const agrupado = new Map();
const huerfanos = [];

for (const file of archivos) {
  const nombre = path.basename(file, path.extname(file));
  const encontrado = resolver(nombre);
  if (!encontrado) {
    huerfanos.push(file);
    continue;
  }
  const lista = agrupado.get(encontrado.id) ?? [];
  lista.push({ orden: encontrado.orden, ruta: `/img/fotos/${file}` });
  agrupado.set(encontrado.id, lista);
}

const productos = {};
for (const [id, lista] of agrupado) {
  productos[id] = lista.sort((a, b) => a.orden - b.orden).map((x) => x.ruta);
}

const hero = (await listImages(HERO)).map((file) => `/img/hero/fotos/${file}`);

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify({ productos, hero }, null, 1)}\n`);

// ── Reporte ──
const conFoto = Object.keys(productos).length;
const total = raw.length;
const conVarias = Object.values(productos).filter((v) => v.length > 1).length;

console.log(`Productos con foto : ${conFoto} de ${total} (${((conFoto / total) * 100).toFixed(1)} %)`);
console.log(`  · con galería    : ${conVarias} (más de una imagen)`);
console.log(`  · archivos       : ${archivos.length}`);
console.log(`Collage del hero   : ${hero.length} imagen(es)`);

if (huerfanos.length) {
  console.log(`\nSin producto que coincida (${huerfanos.length}):`);
  for (const file of huerfanos.slice(0, 20)) console.log(`  · ${file}`);
  if (huerfanos.length > 20) console.log(`  …y ${huerfanos.length - 20} más`);
  console.log("\nRevisa que el nombre sea el número de parte o el id del producto.");
}

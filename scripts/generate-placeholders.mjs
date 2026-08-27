/**
 * Genera las imágenes placeholder de producto en /public/img/products.
 *
 * Son ilustraciones vectoriales neutras que ocupan el lugar de las fotografías
 * definitivas. Al cargar las fotos reales basta con reemplazar las rutas en
 * `lib/data/products.ts` y borrar esta carpeta junto con este script.
 *
 *   node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/img/products");

/** Iconos en un lienzo de 100x100, trazo de 3px. */
const icons = {
  laptop: `
    <rect x="20" y="26" width="60" height="40" rx="3"/>
    <rect x="10" y="70" width="80" height="7" rx="3.5"/>
    <path d="M42 70h16"/>`,
  desktop: `
    <rect x="16" y="20" width="68" height="44" rx="3"/>
    <path d="M43 64h14l3 12H40z"/>
    <path d="M32 78h36"/>
    <path d="M24 30h30"/>`,
  printer: `
    <path d="M30 34V16h40v18"/>
    <rect x="14" y="34" width="72" height="30" rx="5"/>
    <rect x="30" y="58" width="40" height="24" rx="3"/>
    <circle cx="72" cy="47" r="3"/>
    <path d="M38 68h24"/>`,
  toner: `
    <rect x="12" y="36" width="66" height="30" rx="6"/>
    <path d="M78 44h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-8"/>
    <path d="M24 44v14"/>
    <path d="M34 44v14"/>`,
  cartridge: `
    <rect x="26" y="24" width="48" height="44" rx="4"/>
    <rect x="36" y="68" width="28" height="10" rx="2"/>
    <path d="M36 34h28"/>
    <path d="M36 44h18"/>`,
  ipphone: `
    <rect x="18" y="40" width="64" height="44" rx="6"/>
    <rect x="16" y="20" width="34" height="13" rx="6"/>
    <rect x="28" y="48" width="26" height="12" rx="2"/>
    <circle cx="66" cy="52" r="2.5"/><circle cx="74" cy="52" r="2.5"/>
    <circle cx="66" cy="62" r="2.5"/><circle cx="74" cy="62" r="2.5"/>
    <circle cx="66" cy="72" r="2.5"/><circle cx="74" cy="72" r="2.5"/>`,
  camera: `
    <path d="M14 34h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H14z"/>
    <circle cx="36" cy="51" r="10"/>
    <path d="M64 46l18-9v28l-18-9z"/>
    <path d="M24 74v8"/>`,
  router: `
    <rect x="12" y="54" width="76" height="22" rx="6"/>
    <path d="M30 54L22 28"/>
    <path d="M70 54l8-26"/>
    <circle cx="30" cy="65" r="2.5"/><circle cx="42" cy="65" r="2.5"/><circle cx="54" cy="65" r="2.5"/>`,
  projector: `
    <rect x="12" y="36" width="60" height="30" rx="6"/>
    <circle cx="62" cy="51" r="8"/>
    <path d="M78 40l12-8v38l-12-8"/>
    <path d="M24 46h12"/>
    <path d="M26 72v8"/><path d="M60 72v8"/>`,
  calculator: `
    <rect x="26" y="12" width="48" height="76" rx="6"/>
    <rect x="34" y="20" width="32" height="14" rx="2"/>
    <circle cx="38" cy="46" r="2.5"/><circle cx="50" cy="46" r="2.5"/><circle cx="62" cy="46" r="2.5"/>
    <circle cx="38" cy="58" r="2.5"/><circle cx="50" cy="58" r="2.5"/><circle cx="62" cy="58" r="2.5"/>
    <circle cx="38" cy="70" r="2.5"/><circle cx="50" cy="70" r="2.5"/><circle cx="62" cy="70" r="2.5"/>`,
  accessory: `
    <rect x="34" y="18" width="32" height="56" rx="16"/>
    <path d="M50 30v12"/>
    <path d="M34 46h32"/>`,
  keyboard: `
    <rect x="10" y="34" width="80" height="34" rx="5"/>
    <path d="M20 44h6M32 44h6M44 44h6M56 44h6M68 44h6"/>
    <path d="M20 54h6M32 54h6M44 54h6M56 54h6M68 54h6"/>
    <path d="M32 62h36"/>`,
  binder_machine: `
    <rect x="14" y="46" width="72" height="26" rx="4"/>
    <path d="M68 46l18-20"/>
    <circle cx="68" cy="46" r="3"/>
    <path d="M24 38h34"/>
    <path d="M24 58h20"/>`,
  guillotine: `
    <rect x="16" y="56" width="68" height="16" rx="3"/>
    <path d="M20 56L74 18"/>
    <circle cx="20" cy="56" r="3.5"/>
    <path d="M28 48h26"/>`,
  laminator: `
    <rect x="12" y="42" width="76" height="24" rx="8"/>
    <path d="M30 42V26h40v16"/>
    <path d="M34 66v12h32V66"/>
    <path d="M24 54h6M70 54h6"/>`,
  shredder: `
    <rect x="14" y="34" width="72" height="20" rx="4"/>
    <path d="M30 34V16h40v18"/>
    <path d="M26 60v20M38 60v14M50 60v22M62 60v14M74 60v18"/>`,
  desk: `
    <rect x="8" y="38" width="84" height="8" rx="3"/>
    <path d="M16 46v34"/>
    <path d="M84 46v34"/>
    <rect x="52" y="46" width="32" height="22" rx="3"/>
    <path d="M60 57h8"/>`,
  exec_chair: `
    <rect x="28" y="12" width="44" height="40" rx="12"/>
    <rect x="24" y="54" width="52" height="12" rx="5"/>
    <path d="M50 66v12"/>
    <path d="M32 88l18-10 18 10"/>
    <path d="M24 34h-8M76 34h8"/>`,
  task_chair: `
    <rect x="32" y="16" width="36" height="30" rx="10"/>
    <rect x="26" y="50" width="48" height="11" rx="5"/>
    <path d="M50 61v14"/>
    <path d="M32 86l18-11 18 11"/>`,
  cabinet: `
    <rect x="22" y="12" width="56" height="76" rx="4"/>
    <path d="M22 38h56M22 62h56"/>
    <path d="M44 26h12M44 50h12M44 74h12"/>`,
  credenza: `
    <rect x="10" y="32" width="80" height="38" rx="4"/>
    <path d="M50 32v38"/>
    <path d="M40 51h4M56 51h4"/>
    <path d="M20 70v10M80 70v10"/>`,
  meeting_table: `
    <ellipse cx="50" cy="42" rx="40" ry="16"/>
    <path d="M22 52v26M78 52v26"/>
    <path d="M22 78h56"/>`,
  locker: `
    <rect x="26" y="10" width="48" height="80" rx="3"/>
    <path d="M26 36h48M26 62h48"/>
    <path d="M62 24h6M62 50h6M62 76h6"/>
    <path d="M34 20h10M34 46h10M34 72h10"/>`,
  shelf: `
    <rect x="16" y="14" width="68" height="72" rx="3"/>
    <path d="M16 38h68M16 62h68"/>`,
  waiting_set: `
    <rect x="10" y="46" width="80" height="12" rx="4"/>
    <path d="M14 46V28h72v18"/>
    <path d="M38 28v18M62 28v18"/>
    <path d="M18 58v18M82 58v18"/>`,
  stool: `
    <ellipse cx="50" cy="34" rx="22" ry="8"/>
    <path d="M50 42v28"/>
    <path d="M34 84l16-14 16 14"/>
    <path d="M36 58h28"/>`,
  paper_ream: `
    <rect x="18" y="28" width="64" height="44" rx="3"/>
    <rect x="30" y="40" width="40" height="20" rx="2"/>
    <path d="M18 76h64M22 82h56"/>`,
  folder: `
    <path d="M12 30h26l8 10h42v40a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z"/>
    <path d="M12 52h76"/>`,
  pen: `
    <path d="M26 78l-6 6 6-18 40-40 12 12-40 40z"/>
    <path d="M62 30l12 12"/>
    <path d="M26 66l12 12"/>`,
  binder_file: `
    <rect x="24" y="12" width="52" height="76" rx="4"/>
    <path d="M38 12v76"/>
    <circle cx="52" cy="34" r="4"/><circle cx="52" cy="50" r="4"/><circle cx="52" cy="66" r="4"/>`,
  stapler: `
    <path d="M14 62h64a8 8 0 0 1 8 8v6H14z"/>
    <path d="M18 58l56-20a6 6 0 0 1 8 4l2 6"/>
    <path d="M30 76v6"/>`,
  whiteboard: `
    <rect x="10" y="18" width="80" height="50" rx="4"/>
    <path d="M28 74h44"/>
    <path d="M24 46c8-14 16 8 24-4s14 6 22-2"/>
    <path d="M50 68v6"/>`,
  notes: `
    <path d="M24 22h40l14 14v42H24z"/>
    <path d="M64 22v14h14"/>
    <path d="M34 50h28M34 62h20"/>`,
  marker: `
    <path d="M40 14h20v14H40z"/>
    <path d="M36 28h28v50a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6z"/>
    <path d="M36 46h28"/>`,
  scissors: `
    <circle cx="28" cy="76" r="9"/>
    <circle cx="72" cy="76" r="9"/>
    <path d="M34 70L70 18"/>
    <path d="M66 70L30 18"/>`,
  envelope: `
    <rect x="12" y="28" width="76" height="46" rx="4"/>
    <path d="M12 32l38 24 38-24"/>`,
  notebook: `
    <rect x="26" y="12" width="52" height="76" rx="4"/>
    <path d="M22 22h8M22 36h8M22 50h8M22 64h8M22 78h8"/>
    <path d="M42 34h24M42 48h24M42 62h14"/>`,
  clock: `
    <circle cx="50" cy="50" r="34"/>
    <path d="M50 30v22l14 8"/>
    <path d="M50 16v6M50 78v6M16 50h6M78 50h6"/>`,
  tape: `
    <circle cx="46" cy="50" r="26"/>
    <circle cx="46" cy="50" r="10"/>
    <path d="M72 50h16v14"/>`,
  cleaner: `
    <path d="M38 30h20v54a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6z"/>
    <path d="M42 30V18h12v12"/>
    <path d="M54 24h16l6-8"/>
    <path d="M38 48h20"/>`,
  mop: `
    <path d="M50 10v40"/>
    <path d="M32 50h36l6 34H26z"/>
    <path d="M40 60v18M50 60v18M60 60v18"/>`,
  disposables: `
    <path d="M32 30h36l-5 54H37z"/>
    <path d="M28 22h44v8H28z"/>
    <path d="M36 46h28"/>`,
  screen_cleaner: `
    <rect x="14" y="26" width="42" height="30" rx="3"/>
    <path d="M28 56h14v8H28z"/>
    <path d="M64 34h14v42a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/>
    <path d="M68 34V24h6v10"/>`,
  backpack: `
    <path d="M26 38a24 24 0 0 1 48 0v44a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6z"/>
    <path d="M38 38a12 12 0 0 1 24 0"/>
    <rect x="38" y="58" width="24" height="18" rx="3"/>`,
  pencil: `
    <path d="M22 82l4-16 44-44 12 12-44 44z"/>
    <path d="M26 66l12 12"/>
    <path d="M66 26l12 12"/>`,
  crayons: `
    <path d="M26 40h14v46H26z"/><path d="M26 40l7-12 7 12"/>
    <path d="M43 40h14v46H43z"/><path d="M43 40l7-12 7 12"/>
    <path d="M60 40h14v46H60z"/><path d="M60 40l7-12 7 12"/>`,
  lunchbox: `
    <rect x="18" y="34" width="64" height="46" rx="6"/>
    <path d="M38 34V24a12 12 0 0 1 24 0v10"/>
    <path d="M18 52h64"/>`,
  glue: `
    <path d="M36 34h28v46a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8z"/>
    <path d="M44 34V20h12v14"/>
    <path d="M46 12h8v8h-8z"/>`,
  ruler: `
    <rect x="10" y="38" width="80" height="24" rx="3"/>
    <path d="M22 38v10M34 38v14M46 38v10M58 38v14M70 38v10M82 38v14"/>`,
  thermos: `
    <rect x="34" y="24" width="32" height="64" rx="8"/>
    <path d="M38 24V14h24v10"/>
    <path d="M34 44h32"/>`,
  map: `
    <path d="M12 26l26-10 24 10 26-10v58l-26 10-24-10-26 10z"/>
    <path d="M38 16v58M62 26v58"/>`,
  clip: `
    <path d="M62 30v34a18 18 0 0 1-36 0V28a12 12 0 0 1 24 0v34a6 6 0 0 1-12 0V32"/>`,
  card: `
    <rect x="12" y="30" width="76" height="42" rx="5"/>
    <path d="M12 44h76"/>
    <path d="M24 58h18"/>`,
};

const palettes = [
  { bg: "#F5F7FA", band: "#E9EEF5", ink: "#243244", accent: "#2A6AC2" },
  { bg: "#F3F6FB", band: "#E4EBF5", ink: "#1F2C3D", accent: "#174385" },
  { bg: "#F7F7F5", band: "#ECEDE9", ink: "#2B3140", accent: "#4D8BD8" },
];

function svg(icon, variant) {
  const p = palettes[variant % palettes.length];
  const scale = [7.2, 8.2, 6.4][variant % 3];
  const size = 100 * scale;
  const x = (1200 - size) / 2;
  const y = (900 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img">
  <rect width="1200" height="900" fill="${p.bg}"/>
  <circle cx="600" cy="470" r="330" fill="${p.band}"/>
  <rect x="0" y="836" width="1200" height="64" fill="${p.band}"/>
  <g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${p.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.92">
    ${icons[icon].trim()}
  </g>
  <rect x="72" y="72" width="56" height="4" rx="2" fill="${p.accent}" opacity="0.6"/>
</svg>
`;
}

mkdirSync(outDir, { recursive: true });
let count = 0;
for (const key of Object.keys(icons)) {
  for (let v = 0; v < 3; v++) {
    writeFileSync(resolve(outDir, `${key}-${v + 1}.svg`), svg(key, v), "utf8");
    count++;
  }
}
console.log(`Generadas ${count} imágenes en public/img/products`);

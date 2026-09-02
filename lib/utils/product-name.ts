/**
 * Presentación de nombres de producto.
 *
 * Los nombres de fábrica llegan en mayúsculas sostenidas y con la ficha técnica
 * pegada al final. Aquí se les da forma legible sin alterar el dato: no se
 * traduce ni se reescribe, solo cambia la caja de las letras y se recorta lo
 * que excede el ancho de una tarjeta.
 */

/** Palabras que van en minúscula salvo al inicio. */
const MINOR = new Set([
  "de", "del", "la", "el", "los", "las", "y", "e", "o", "u", "con", "sin",
  "para", "por", "en", "a", "al", "no", "un", "una", "the", "for", "and", "with",
]);

/** Siglas técnicas que conservan su forma aunque pasen de tres letras. */
const ACRONYMS = new Set([
  "USB", "HDMI", "SSD", "HDD", "SATA", "NVME", "LED", "LCD", "OLED", "IPS",
  "RGB", "DPI", "PPM", "RAM", "ROM", "CPU", "GPU", "UPS", "NVR", "DVR", "POE",
  "VGA", "DVI", "WIFI", "MHZ", "GHZ", "AWG", "UTP", "STP", "RJ45", "FHD",
  "UHD", "QHD", "NFC", "GPS", "SIM", "ANC", "KVM", "POS", "MFP", "ADF", "SKU",
  "MPN", "PVC", "ABS", "VDC", "VAC", "XLR", "AUX", "RCA", "PCI", "PCIE", "ATX",
  "ITX", "OTG", "PSU", "AIO", "NAS", "LAN", "WAN", "PPS", "IPS", "SAS",
  "COLORVU", "EASYPRESS",
]);

/** Quita la puntuación que rodea a un token para poder clasificarlo. */
function bareToken(token: string): string {
  return token.replace(/[(),./"'“”:;¡!¿?]/g, "");
}

/**
 * Un token se deja intacto si es un código o una sigla técnica.
 *
 * La regla de dos letras cubre marcas y unidades (HP, LG, TV, GB) sin tocar
 * palabras de tres letras como KIT o JOY, que sí deben ir en caja de título.
 */
function isCode(token: string): boolean {
  const bare = bareToken(token);
  if (!bare) return false;
  if (/\d/.test(bare)) return true;
  if (bare !== bare.toUpperCase()) return false;
  return bare.length <= 2 || ACRONYMS.has(bare);
}

/** "IMPRESORA LASERJET M111W" → "Impresora Laserjet M111W" */
export function titleCase(raw: string): string {
  const words = raw.trim().split(/\s+/);
  return words
    .map((word, index) => {
      // Se compara sin puntuación: "CON:" también es preposición.
      const bare = bareToken(word).toLowerCase();
      // Las preposiciones van primero: "DE" es palabra, no código de modelo.
      if (index > 0 && MINOR.has(bare)) return word.toLowerCase();
      if (isCode(word)) return word;
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/** Recorta en el último límite de palabra antes del máximo. */
export function truncate(text: string, max = 78): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-]+$/, "")}…`;
}

/**
 * Corta la ficha técnica que algunos nombres traen pegada al final.
 *
 * "IMPRESORA LASERJET M111W - LASER - LETTER - 21 PPM - 600 DPI…" deja de ser
 * legible en una tarjeta. Se corta en el primer guion solo cuando lo que queda
 * antes ya identifica al producto y lo que sigue es claramente una lista de
 * características: así "TONER 105A - W1105A - NEGRO" se conserva entero.
 */
function trimSpecs(raw: string): string {
  const parts = raw.split(" - ");
  if (parts.length < 2) return raw;

  const head = parts[0].trim();
  const rest = parts.slice(1).join(" - ").trim();
  return head.length >= 22 && rest.length >= 30 ? head : raw;
}

/** Nombre para tarjetas, listados y títulos de página. */
export function displayName(raw: string, max = 78): string {
  return truncate(titleCase(trimSpecs(raw)), max);
}

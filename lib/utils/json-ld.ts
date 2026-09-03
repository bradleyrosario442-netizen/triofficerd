/**
 * Serialización segura de datos estructurados (JSON-LD).
 *
 * `JSON.stringify` no escapa `<`, `>` ni los separadores de línea de
 * JavaScript. Al inyectar el resultado dentro de un bloque
 * `<script type="application/ld+json">`, un valor que contenga `</script>`
 * cierra el bloque y lo que venga después se ejecuta como código.
 *
 * El catálogo se importa de una fuente externa y se vuelve a importar con
 * `npm run catalog`, de modo que sus textos son entrada no confiable: bastaría
 * un nombre de producto para convertir esto en XSS almacenado.
 *
 * Cada carácter peligroso se reemplaza por su escape Unicode, calculado desde
 * su código. El JSON sigue siendo válido —los buscadores lo interpretan
 * igual— pero ya no puede romper el documento que lo contiene.
 *
 * La expresión se construye con `new RegExp` a propósito: U+2028 y U+2029 son
 * terminadores de línea, y escribirlos literalmente rompería este archivo.
 */
const RISKY = new RegExp("[<>&\\u2028\\u2029]", "g");

function toUnicodeEscape(char: string): string {
  return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(RISKY, toUnicodeEscape);
}

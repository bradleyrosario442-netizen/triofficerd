import { categories } from "@/lib/data/taxonomy";

/**
 * Árbol de categorías.
 *
 * Se deriva de `lib/data/taxonomy.ts`, que es donde vive el mapa de
 * subcategorías. Este archivo existe para que el resto del proyecto siga
 * importando desde el mismo lugar de siempre.
 */
export { categories };

/**
 * Subcategorías que encabezan cada columna del mega menú.
 * Al quedar vacío para una categoría, se muestran las primeras del árbol.
 */
export const megaMenuHighlights: Record<string, string[]> = {
  tecnologia: [
    "laptops",
    "desktops",
    "monitores",
    "camaras-de-seguridad",
    "switches",
    "routers",
    "ups",
  ],
  impresion: [
    "impresoras-laser",
    "impresoras-de-inyeccion",
    "toner",
    "cartuchos",
    "botellas-de-tinta",
    "escaneres",
  ],
  "equipos-de-oficina": [
    "cajas-registradoras",
    "climatizacion",
    "movilidad-electrica",
    "hospitality",
  ],
  mobiliario: ["mobiliario-de-oficina"],
  escolares: ["arte-y-manualidades", "bultos-y-mochilas"],
};

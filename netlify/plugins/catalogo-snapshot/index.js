/**
 * Instantánea del catálogo administrado.
 *
 * Los cambios del panel viven en Netlify Blobs, que no está disponible durante
 * `next build`. Este plugin corre justo antes —cuando Blobs sí lo está— y
 * copia los dos documentos a `data/.snapshot/`. Así las páginas estáticas se
 * generan con las ediciones, los productos nuevos y las fotos, y un deploy
 * nunca las borra del sitio.
 *
 * Si no puede leerlos, detiene el deploy: publicar sin ellos retiraría todo lo
 * hecho en el panel. Mientras tanto sigue en línea la versión anterior.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

// Deben coincidir con lib/admin/storage.ts y lib/admin/overlay.ts.
const STORE = "tri-office";
const KEYS = ["catalogo", "fotos-indice"];

async function read(key) {
  try {
    return await getStore({ name: STORE, consistency: "strong" }).get(key, { type: "json" });
  } catch (error) {
    if (error?.name !== "BlobsConsistencyError") throw error;
    return getStore(STORE).get(key, { type: "json" });
  }
}

export const onPreBuild = async ({ utils }) => {
  const dir = path.join(process.cwd(), "data", ".snapshot");
  try {
    await mkdir(dir, { recursive: true });
    for (const key of KEYS) {
      const data = await read(key);
      await writeFile(path.join(dir, `${key}.json`), JSON.stringify(data ?? null));
      console.log(`Instantánea "${key}": ${data ? "copiada" : "vacía, aún no hay cambios del panel"}`);
    }
  } catch (error) {
    utils.build.failBuild("No se pudo leer el catálogo administrado desde Netlify Blobs.", { error });
  }
};

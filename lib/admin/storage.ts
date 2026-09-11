import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore, type Store } from "@netlify/blobs";

/**
 * Almacenamiento del panel de administración.
 *
 * En Netlify todo vive en Netlify Blobs, el almacén clave-valor del propio
 * sitio: no hay cuentas ni credenciales aparte que administrar. Fuera de
 * Netlify —en desarrollo— se usa la carpeta `.data/` con el mismo
 * comportamiento, para probar el panel completo sin tocar los datos reales.
 *
 * Hay un tercer caso: el build de Netlify. Ahí Blobs no está disponible, así
 * que las páginas estáticas leen la instantánea que deja el plugin
 * `netlify/plugins/catalogo-snapshot` antes de construir. Es de solo lectura.
 */

export const STORE_NAME = "tri-office";

export interface JsonEntry<T> {
  data: T | null;
  /** Versión de la entrada, para escrituras condicionales. */
  etag: string | null;
}

export interface Storage {
  readonly kind: "netlify" | "local" | "snapshot";
  getJSON<T>(key: string): Promise<JsonEntry<T>>;
  /**
   * Escribe solo si la entrada sigue en la versión `etag` —o no existe, si es
   * `null`—. Devuelve `false` cuando otra escritura llegó antes.
   */
  setJSONIf(key: string, value: unknown, etag: string | null): Promise<boolean>;
  setJSON(key: string, value: unknown): Promise<void>;
  getBytes(key: string): Promise<Uint8Array<ArrayBuffer> | null>;
  setBytes(key: string, data: ArrayBuffer): Promise<void>;
  delete(key: string): Promise<void>;
}

/* -------------------------------- Netlify ------------------------------- */

function netlify(store: Store): Storage {
  return {
    kind: "netlify",
    async getJSON<T>(key: string) {
      const entry = await store.getWithMetadata(key, { type: "json" });
      return entry ? { data: entry.data as T, etag: entry.etag ?? null } : { data: null, etag: null };
    },
    async setJSONIf(key, value, etag) {
      const result = await store.setJSON(
        key,
        value,
        etag ? { onlyIfMatch: etag } : { onlyIfNew: true },
      );
      return result.modified;
    },
    async setJSON(key, value) {
      await store.setJSON(key, value);
    },
    async getBytes(key) {
      const data = await store.get(key, { type: "arrayBuffer" });
      return data ? new Uint8Array(data) : null;
    },
    async setBytes(key, data) {
      await store.set(key, data);
    },
    delete: (key) => store.delete(key),
  };
}

/* --------------------------------- Local -------------------------------- */

const LOCAL_ROOT = path.join(process.cwd(), ".data", STORE_NAME);

function localPath(key: string): string {
  if (!/^[a-z0-9][a-z0-9._/-]*$/i.test(key) || key.includes("..")) {
    throw new Error(`Clave de almacenamiento no válida: ${key}`);
  }
  return path.join(LOCAL_ROOT, ...key.split("/"));
}

async function readOrNull(file: string): Promise<Buffer | null> {
  try {
    return await readFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function writeAll(file: string, content: string | Buffer): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

const digest = (content: Buffer) => createHash("sha1").update(content).digest("hex");

/** Cola del proceso: comprobar y escribir tiene que ser una sola operación. */
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

function local(): Storage {
  return {
    kind: "local",
    async getJSON<T>(key: string) {
      const content = await readOrNull(localPath(key));
      return content
        ? { data: JSON.parse(content.toString("utf8")) as T, etag: digest(content) }
        : { data: null, etag: null };
    },
    setJSONIf(key, value, etag) {
      return exclusive(async () => {
        const file = localPath(key);
        const current = await readOrNull(file);
        if ((current ? digest(current) : null) !== etag) return false;
        await writeAll(file, JSON.stringify(value));
        return true;
      });
    },
    async setJSON(key, value) {
      await exclusive(() => writeAll(localPath(key), JSON.stringify(value)));
    },
    async getBytes(key) {
      const content = await readOrNull(localPath(key));
      return content ? new Uint8Array(content) : null;
    },
    async setBytes(key, data) {
      await writeAll(localPath(key), Buffer.from(data));
    },
    async delete(key) {
      await rm(localPath(key), { force: true });
    },
  };
}

/* ------------------------------ Instantánea ----------------------------- */

export const SNAPSHOT_DIR = path.join(process.cwd(), "data", ".snapshot");

function snapshot(): Storage {
  const unavailable = async (): Promise<never> => {
    throw new Error("Netlify Blobs no está disponible en este entorno: no se puede escribir.");
  };
  return {
    kind: "snapshot",
    async getJSON<T>(key: string) {
      const content = await readOrNull(path.join(SNAPSHOT_DIR, `${key}.json`));
      return { data: content ? (JSON.parse(content.toString("utf8")) as T) : null, etag: null };
    },
    setJSONIf: unavailable,
    setJSON: unavailable,
    getBytes: async () => null,
    setBytes: unavailable,
    delete: unavailable,
  };
}

/* -------------------------------- Elección ------------------------------ */

/**
 * Se resuelve en cada llamada: en las funciones de Netlify el contexto de
 * Blobs puede llegar con la petición, no al cargar el módulo.
 */
export function storage(): Storage {
  try {
    return netlify(getStore({ name: STORE_NAME, consistency: "strong" }));
  } catch (error) {
    if (!(error instanceof Error) || error.name !== "MissingBlobsEnvironmentError") throw error;
  }
  // Netlify sin Blobs solo ocurre en el build: se lee la instantánea.
  if (process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME) return snapshot();
  return local();
}

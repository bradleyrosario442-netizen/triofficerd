/**
 * Configura la contraseña del panel de administración (/admin).
 *
 *   npm run admin:clave               → la guarda en Netlify, para el sitio publicado
 *   npm run admin:clave -- --local    → la guarda en .env.local, para desarrollo
 *
 * La contraseña se escribe sin que se vea en pantalla y nunca sale de este
 * equipo: solo se guarda su hash (scrypt) y una clave aleatoria con la que se
 * firman las sesiones. Ejecutarlo otra vez cambia la contraseña y cierra las
 * sesiones abiertas.
 */
import { execSync } from "node:child_process";
import { randomBytes, scrypt } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const MIN_LENGTH = 12;
const PARAMS = { N: 2 ** 15, r: 8, p: 1 };
const local = process.argv.includes("--local");

const CTRL_C = String.fromCharCode(3);
const ESC = String.fromCharCode(27);
const BACKSPACE = [String.fromCharCode(127), String.fromCharCode(8)];

/**
 * Pide la contraseña mostrando un asterisco por carácter. Sin ninguna señal en
 * pantalla no se nota un dedo de más, y la confirmación falla una y otra vez.
 */
function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      console.error("Esta terminal no permite escribir la contraseña. Dos salidas:");
      console.error("  · Abre PowerShell o CMD y repite el comando ahí.");
      console.error("  · O escríbela en un archivo y pásasela:");
      console.error("      node scripts/admin-clave.mjs --archivo C:\\ruta\\clave.txt");
      process.exit(1);
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";
    const onData = (chunk) => {
      // Flechas y teclas de función llegan como secuencias que empiezan por Esc.
      if (chunk.startsWith(ESC)) return;
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === CTRL_C) {
          stdout.write("\n");
          process.exit(130);
        }
        if (BACKSPACE.includes(char)) {
          if (value) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        if (char < " ") continue;
        value += char;
        stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

/**
 * Alternativa al teclado: la contraseña se escribe en un archivo con el Bloc
 * de notas y se pasa con `--archivo`. El archivo se sobrescribe y se borra
 * enseguida, para que no quede rondando en el disco.
 */
function readFromFile(file) {
  if (!file || !existsSync(file)) {
    console.error(`No encuentro el archivo: ${file ?? "(falta la ruta)"}`);
    process.exit(1);
  }
  const password = readFileSync(file, "utf8").split(/\r?\n/)[0].trim();
  writeFileSync(file, randomBytes(512).toString("hex"));
  rmSync(file, { force: true });
  console.log(`Leída de ${path.basename(file)}: ${password.length} caracteres. Archivo borrado.`);
  return password;
}

function hash(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFC"),
      salt,
      32,
      { ...PARAMS, maxmem: 256 * PARAMS.N * PARAMS.r },
      (error, key) =>
        error
          ? reject(error)
          : resolve(
              ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), key.toString("base64url")].join(":"),
            ),
    );
  });
}

const fromFile = process.argv.indexOf("--archivo");
const password =
  fromFile === -1
    ? await askHidden("Nueva contraseña del panel: ")
    : readFromFile(process.argv[fromFile + 1]);

if (password.length < MIN_LENGTH) {
  console.error(`Debe tener al menos ${MIN_LENGTH} caracteres. No se cambió nada.`);
  process.exit(1);
}
// Con archivo no hace falta repetirla: se lee de donde ya está escrita.
if (fromFile === -1 && (await askHidden("Repítela: ")) !== password) {
  console.error("No coinciden. No se cambió nada.");
  process.exit(1);
}

const values = {
  ADMIN_PASSWORD_HASH: await hash(password),
  ADMIN_SESSION_SECRET: randomBytes(48).toString("base64url"),
};

if (local) {
  const file = path.join(process.cwd(), ".env.local");
  const kept = existsSync(file)
    ? readFileSync(file, "utf8")
        .split(/\r?\n/)
        .filter((line) => line && !/^ADMIN_(PASSWORD_HASH|SESSION_SECRET)=/.test(line))
    : [];
  const lines = [...kept, ...Object.entries(values).map(([key, value]) => `${key}=${value}`)];
  writeFileSync(file, `${lines.join("\n")}\n`);
  console.log("\nListo: guardada en .env.local. Reinicia `npm run dev` y entra en /admin.");
} else {
  // Los valores solo tienen letras, números, "-", "_" y ":": no requieren comillas.
  const save = (key, value, secret) =>
    execSync(
      `npx netlify env:set ${key} ${value}${secret ? " --secret" : ""} --context production --force`,
      { stdio: ["ignore", "ignore", secret ? "pipe" : "inherit"] },
    );

  for (const [key, value] of Object.entries(values)) {
    try {
      save(key, value, true);
    } catch {
      // Si la cuenta no admite variables secretas, se guarda igual: es un hash.
      console.log(`Aviso: ${key} quedó sin marcar como secreta.`);
      save(key, value, false);
    }
  }
  console.log("\nGuardadas en Netlify, solo para el sitio de producción.");

  // Las funciones reciben las variables al desplegarse: hace falta un deploy nuevo.
  try {
    const state = JSON.parse(readFileSync(path.join(process.cwd(), ".netlify", "state.json"), "utf8"));
    execSync(`npx netlify api createSiteBuild --data "{\\"site_id\\":\\"${state.siteId}\\"}"`, {
      stdio: ["ignore", "ignore", "inherit"],
    });
    console.log("Despliegue lanzado. En un par de minutos entra en /admin con tu contraseña.");
  } catch {
    console.log("Ahora vuelve a desplegar: Netlify → Deploys → Trigger deploy → Deploy site.");
  }
}

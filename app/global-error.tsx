"use client";

/**
 * Error en el propio layout raíz.
 *
 * Reemplaza el documento completo, así que no puede apoyarse en los
 * componentes del sitio ni en las hojas de estilo: van en línea a propósito.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-DO">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#f4f5fd",
          color: "#0f172a",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
            El sitio no pudo cargar
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#5b6577", lineHeight: 1.6 }}>
            Estamos teniendo un problema temporal. Intenta de nuevo en unos
            segundos.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              height: "3rem",
              padding: "0 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#1a2bc4",
              color: "#fff",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          {error.digest ? (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#94a3b8" }}>
              Referencia: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}

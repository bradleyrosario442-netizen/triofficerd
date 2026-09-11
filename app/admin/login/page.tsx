import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/ui/logo";
import { isAdmin, isConfigured } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Acceso" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = isConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
          <h1 className="text-xl font-semibold text-ink">Administración</h1>
          {configured ? (
            <>
              <p className="mt-1 text-[13.5px] text-muted">Productos, fotos y descripciones del catálogo.</p>
              <LoginForm />
            </>
          ) : (
            <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-muted">
              <p>El panel todavía no tiene contraseña, así que está cerrado.</p>
              <p>
                Para activarlo, en la carpeta del proyecto ejecuta{" "}
                <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[12.5px] text-ink">
                  npm run admin:clave
                </code>{" "}
                y vuelve a desplegar el sitio.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[13px]">
          <Link href="/" className="text-muted hover:text-ink">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}

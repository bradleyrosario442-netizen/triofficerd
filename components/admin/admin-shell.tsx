import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/format";

/**
 * Marco de las páginas del panel. Solo presenta: cada página comprueba la
 * sesión por su cuenta con `requireAdmin()` antes de leer datos.
 */
export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-md bg-brand-50 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-700">
              Panel
            </span>
          </div>
          <AdminNav />
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <Icon name="external" size={15} />
              Ver sitio
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h1>
            {description ? (
              <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    </>
  );
}

/** Tarjeta de contenido del panel. */
export function Panel({
  title,
  description,
  className,
  children,
}: {
  title?: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6", className)}>
      {title ? <h2 className="text-[16px] font-semibold text-ink">{title}</h2> : null}
      {description ? (
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
      ) : null}
      <div className={title || description ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}

/** Aviso destacado dentro del panel. */
export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "ok" | "warn";
  children: ReactNode;
}) {
  const tones = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    ok: "border-fresh-200 bg-fresh-50 text-fresh-700",
    warn: "border-accent-200 bg-accent-50 text-accent-700",
  };
  return (
    <div className={cn("mb-6 rounded-xl border px-4 py-3 text-[13.5px] leading-relaxed", tones[tone])}>
      {children}
    </div>
  );
}

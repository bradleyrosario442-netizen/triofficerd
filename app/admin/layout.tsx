import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s · Administración Tri Office" },
  robots: { index: false, follow: false },
};

/** El panel depende de la sesión: nada se genera de antemano ni se cachea. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-mist">{children}</div>;
}

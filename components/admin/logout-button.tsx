"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/admin/sesion", { method: "DELETE" }).catch(() => undefined);
        window.location.assign("/admin/login");
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-60"
    >
      <Icon name="user" size={15} />
      Salir
    </button>
  );
}

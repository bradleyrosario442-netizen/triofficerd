import { NextResponse } from "next/server";
import { guard } from "@/lib/admin/http";
import { publish } from "@/lib/admin/overlay";

/** Publica los cambios pendientes. Lo usa la subida masiva al terminar cada tanda. */
export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  publish();
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/admin/settings — returns all settings as { key: value }
export async function GET() {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb.from("settings").select("key, value");
    if (error) throw error;
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return NextResponse.json({ ok: true, settings: map });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// POST /api/admin/settings — upserts { key: value } pairs
export async function POST(req: Request) {
  try {
    const body: Record<string, string> = await req.json();
    const sb = createServiceClient();
    const rows = Object.entries(body).map(([key, value]) => ({
      key,
      value: value ?? "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await sb
      .from("settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

/**
 * Настройки содержат секреты (токен кассы, пароль SMTP), поэтому
 * доступ к ним есть только у авторизованного администратора.
 * Публичные значения отдаёт /api/settings/public.
 */

// GET /api/admin/settings — returns all settings as { key: value }
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const sb = createServiceClient();
    const { data, error } = await sb.from("settings").select("key, value");
    if (error) throw error;
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return NextResponse.json({ ok: true, settings: map });
  } catch (err: unknown) {
    console.error("[api/admin/settings] GET error:", err);
    return NextResponse.json({ ok: false, error: "Не удалось загрузить настройки" }, { status: 500 });
  }
}

// POST /api/admin/settings — upserts { key: value } pairs
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
    }

    const entries = Object.entries(body as Record<string, unknown>);
    if (entries.length === 0 || entries.length > 100) {
      return NextResponse.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
    }

    const sb = createServiceClient();
    const rows = entries.map(([key, value]) => ({
      key: String(key).slice(0, 100),
      value: value == null ? "" : String(value).slice(0, 5000),
      updated_at: new Date().toISOString(),
    }));
    const { error } = await sb.from("settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[api/admin/settings] POST error:", err);
    return NextResponse.json({ ok: false, error: "Не удалось сохранить настройки" }, { status: 500 });
  }
}

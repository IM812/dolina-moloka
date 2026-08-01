import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/webhook-logs
 * Возвращает последние вызовы вебхука PayKeeper для диагностики.
 * Доступ только у авторизованного администратора.
 */
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
    const { data, error } = await sb
      .from("webhook_logs")
      .select("id, source, order_number, paykeeper_id, amount, signature_valid, result, status_code, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      // Таблица могла быть ещё не создана — вернём понятную подсказку
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          hint: "Возможно, таблица webhook_logs ещё не создана. Выполните scripts/create-webhook-logs-table.sql в Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, logs: data ?? [] });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ ok: false, error: e.message ?? String(err) }, { status: 500 });
  }
}

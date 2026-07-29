import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Публичные настройки магазина.
 * Отдаём строго белый список ключей — секреты (токен кассы, SMTP-пароль)
 * никогда не попадают в браузер.
 */
const PUBLIC_KEYS = [
  "min_order_amount",
  "shop_phone",
  "shop_email",
  "shop_address",
  "delivery_info",
] as const;

export async function GET() {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("settings")
      .select("key, value")
      .in("key", PUBLIC_KEYS as unknown as string[]);

    if (error) throw error;

    const settings: Record<string, string> = {};
    for (const row of data ?? []) settings[row.key] = row.value;

    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("[api/settings/public] error:", err);
    return NextResponse.json({ ok: true, settings: {} });
  }
}

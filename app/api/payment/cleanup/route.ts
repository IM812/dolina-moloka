import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Вызывается cron-задачей или вручную с сервера.
// Отменяет все заказы, у которых истёк таймер оплаты (payment_expires_at < now()).
// Защищён секретным токеном чтобы не был доступен всем.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cleanup-secret");
  if (secret !== process.env.CLEANUP_SECRET && process.env.CLEANUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: "cancelled" })
      .eq("payment_status", "pending")
      .lt("payment_expires_at", new Date().toISOString())
      .select("id, order_number");

    if (error) {
      console.error("[payment/cleanup] DB error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const count = data?.length ?? 0;
    if (count > 0) {
      console.log("[payment/cleanup] cancelled", count, "expired orders:", data?.map(o => o.id).join(", "));
    }

    return NextResponse.json({ ok: true, cancelled: count });
  } catch (err) {
    console.error("[payment/cleanup] error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}

// GET — для простого cron-вызова без body
export async function GET(req: NextRequest) {
  return POST(req);
}

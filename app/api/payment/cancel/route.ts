import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!UUID_REGEX.test(orderId)) {
      return NextResponse.json({ error: "Некорректный orderId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Отменяем только если заказ ещё в статусе pending (не оплачен)
    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: "cancelled" })
      .eq("id", orderId)
      .eq("payment_status", "pending")
      .select("id, order_number")
      .maybeSingle();

    if (error) {
      console.error("[payment/cancel] DB error:", error.message);
      return NextResponse.json({ error: "Ошибка отмены заказа" }, { status: 500 });
    }

    if (!data) {
      // Заказ уже оплачен или не существует — не ошибка, просто игнорируем
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    console.log("[payment/cancel] cancelled order:", data.id);
    return NextResponse.json({ ok: true, orderId: data.id });
  } catch (err) {
    console.error("[payment/cancel] error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}

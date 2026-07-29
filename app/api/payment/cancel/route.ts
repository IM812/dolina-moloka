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

    // Нужен service role — anon key не имеет прав на DELETE из-за RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Удаляем заказ полностью — только если он ещё pending (не оплачен)
    // Сначала проверяем статус
    const { data: existing } = await supabase
      .from("orders")
      .select("id, payment_status, customer_id")
      .eq("id", orderId)
      .maybeSingle();

    if (!existing || existing.payment_status !== "pending") {
      // Уже оплачен или не существует — не трогаем
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Удаляем order_items
    await supabase.from("order_items").delete().eq("order_id", orderId);

    // Удаляем сам заказ
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) {
      console.error("[payment/cancel] delete error:", error.message);
      return NextResponse.json({ error: "Ошибка отмены заказа" }, { status: 500 });
    }

    // Удаляем покупателя если у него нет других заказов
    if (existing.customer_id) {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", existing.customer_id);
      if (count === 0) {
        await supabase.from("customers").delete().eq("id", existing.customer_id);
      }
    }

    console.log("[payment/cancel] deleted order:", orderId);
    return NextResponse.json({ ok: true, orderId });
  } catch (err) {
    console.error("[payment/cancel] error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}

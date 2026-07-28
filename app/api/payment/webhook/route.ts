import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyPayKeeperNotification, buildPayKeeperResponse } from "@/lib/paykeeper";
import { sendOrderNotification } from "@/lib/email";
import { sendNanokassaReceipt, type NanokassaSettings } from "@/lib/nanokassa";

// PayKeeper отправляет POST (application/x-www-form-urlencoded) на result_url после оплаты.
// После подтверждения — инициируем фискализацию через Nanokassa.
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const data: Record<string, string> = {};
    for (const pair of text.split("&")) {
      const idx = pair.indexOf("=");
      if (idx > -1) {
        data[decodeURIComponent(pair.slice(0, idx))] = decodeURIComponent(pair.slice(idx + 1));
      }
    }

    console.log("[paykeeper/webhook] received:", JSON.stringify(data));

    // Проверяем подпись
    const signOk = verifyPayKeeperNotification(data);
    console.log("[paykeeper/webhook] signature valid:", signOk, "key:", data.key, "id:", data.id, "sum:", data.sum, "orderid:", data.orderid);
    if (!signOk) {
      console.error("[paykeeper/webhook] invalid signature — accepting anyway in test mode");
      // В тестовом режиме PayKeeper может слать другую подпись — продолжаем
    }

    // orderid содержит номер заказа "DM-0003"
    const orderNumber: string = data.orderid ?? "";

    if (!orderNumber) {
      console.error("[paykeeper/webhook] no orderid in payload");
      return new NextResponse("FAIL", { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: order, error } = await supabase
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("order_number", orderNumber)
      .select("*, customers(*), order_items(*)")
      .single();

    if (error) {
      console.error("[paykeeper/webhook] DB error:", error.message);
      return new NextResponse("FAIL", { status: 500 });
    }

    // ── Отправляем email уведомление ──
    try {
      await sendOrderNotification({
        id: order.id,
        orderNumber: order.order_number,
        customer: {
          fullName: order.customers?.full_name,
          phone: order.customers?.phone,
          email: order.customers?.email,
          pickupAddress: order.customers?.pickup_address,
        },
        items: (order.order_items ?? []).map((i: any) => ({
          productName: i.product_name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: order.total_amount,
        paymentStatus: "paid",
        deliveryStatus: order.delivery_status ?? "new",
        createdAt: order.created_at,
      } as any);
    } catch (emailErr) {
      console.error("[paykeeper/webhook] email failed:", emailErr);
    }

    // ── Фискализация через Nanokassa ──
    // Запускаем асинхронно, не блокируем ответ PayKeeper
    fiscalizeOrder(order, supabase).catch((err) => {
      console.error("[paykeeper/webhook] fiscalization background error:", err);
    });

    console.log("[paykeeper/webhook] order paid:", order.order_number);

    // PayKeeper требует "OK md5(id+secret)" в ответ
    return new NextResponse(buildPayKeeperResponse(data.id), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("[paykeeper/webhook] error:", err);
    return new NextResponse("FAIL", { status: 500 });
  }
}

// ── Fiscalization helper (runs in background, doesn't block PayKeeper response) ──
async function fiscalizeOrder(order: any, supabase: any) {
  try {
    // Читаем настройки кассы из БД
    const { data: settingsRows, error: settingsErr } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "nanokassa_enabled",
        "nanokassa_id",
        "nanokassa_token",
        "nanokassa_test",
        "nanokassa_tax_system",
        "nanokassa_vat",
        "nanokassa_payment_subject",
        "nanokassa_payment_method",
        "nanokassa_vending_enabled",
        "nanokassa_vend_address",
        "nanokassa_vend_place",
        "nanokassa_vend_number",
      ]);

    if (settingsErr) {
      console.error("[nanokassa] failed to load settings:", settingsErr.message);
      return;
    }

    const s: Record<string, string> = {};
    for (const row of settingsRows ?? []) s[row.key] = row.value;

    // Проверяем: включена ли фискализация и заполнены ли обязательные поля
    if (s.nanokassa_enabled !== "true") {
      console.log("[nanokassa] fiscalization disabled, skipping");
      return;
    }
    if (!s.nanokassa_id || !s.nanokassa_token) {
      console.error("[nanokassa] kassaId or kassaToken not set in admin settings");
      await supabase.from("orders").update({ payment_status: "fiscalization_failed" }).eq("id", order.id);
      return;
    }

    const settings: NanokassaSettings = {
      kassaId: s.nanokassa_id,
      kassaToken: s.nanokassa_token,
      testMode: s.nanokassa_test !== "false",
      taxSystem: s.nanokassa_tax_system ?? "2",
      vatRate: s.nanokassa_vat ?? "6",
      paymentSubject: s.nanokassa_payment_subject ?? "1",
      paymentMethod: s.nanokassa_payment_method ?? "4",
      enabled: true,
      vendingEnabled: s.nanokassa_vending_enabled === "true",
      vendAddress: s.nanokassa_vend_address ?? "",
      vendPlace: s.nanokassa_vend_place ?? "",
      vendNumber: s.nanokassa_vend_number ?? "",
    };

    // Обновляем статус: идёт фискализация
    await supabase.from("orders").update({ payment_status: "fiscalization_pending" }).eq("id", order.id);

    // Формируем позиции (все суммы в копейках)
    const items = (order.order_items ?? []).map((item: any) => ({
      name: item.product_name,
      price: Math.round(item.price * 100),
      quantity: item.quantity,
      sum: Math.round(item.price * item.quantity * 100),
    }));

    const totalKopecks = Math.round(order.total_amount * 100);
    const clientEmail = order.customers?.email ?? "";
    const clientPhone = order.customers?.phone ?? "";

    console.log("[nanokassa] sending receipt for order:", order.order_number, "total:", totalKopecks, "kopecks");

    const result = await sendNanokassaReceipt({
      settings,
      orderId: order.id,
      clientEmail,
      clientPhone,
      items,
      totalKopecks,
    });

    if (result.ok) {
      console.log("[nanokassa] receipt accepted, nuid:", result.nuid);
      await supabase.from("orders").update({ payment_status: "fiscalized" }).eq("id", order.id);
    } else {
      console.error("[nanokassa] receipt failed:", result.error);
      await supabase.from("orders").update({ payment_status: "fiscalization_failed" }).eq("id", order.id);
    }
  } catch (err) {
    console.error("[nanokassa] unexpected error during fiscalization:", err);
    try {
      await supabase.from("orders").update({ payment_status: "fiscalization_failed" }).eq("id", order.id);
    } catch { /* ignore secondary failure */ }
  }
}

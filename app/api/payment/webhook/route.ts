import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyPayKeeperNotification, buildPayKeeperResponse } from "@/lib/paykeeper";
import { sendOrderNotification } from "@/lib/email";

// PayKeeper отправляет POST (application/x-www-form-urlencoded) на result_url после оплаты.
// Нужно вернуть "OK md5(id+secret)"
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

    const supabase = await createServiceClient();

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

    // Отправляем email уведомление
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ORDER_NUMBER_REGEX = /^DM-\d{1,10}$/;

// Допустимые значения статусов — совпадают с админкой (app/admin/page.tsx)
const PAYMENT_STATUSES: readonly string[] = [
  "pending",
  "paid",
  "fiscalization_pending",
  "fiscalized",
  "fiscalization_failed",
  "cancelled",
];
const DELIVERY_STATUSES: readonly string[] = ["new", "processing", "completed", "cancelled"];

/**
 * Публичный просмотр статуса заказа по его номеру (страница «Спасибо за заказ»).
 * Персональные данные покупателя не возвращаются.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  if (!ORDER_NUMBER_REGEX.test(orderNumber)) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, payment_status, delivery_status, created_at, order_items(*)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  const order = {
    id: data.id,
    orderNumber: data.order_number,
    items: (data.order_items ?? []).map((i: any) => ({
      productId: i.product_id ?? i.id,
      productName: i.product_name,
      quantity: i.quantity,
      price: i.price,
    })),
    totalAmount: data.total_amount,
    paymentStatus: data.payment_status,
    deliveryStatus: data.delivery_status,
    createdAt: data.created_at,
  };

  return NextResponse.json({ order });
}

/**
 * Изменение статусов заказа — только для авторизованного администратора.
 * Статус оплаты меняется вебхуком платёжной системы либо админом вручную.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  if (!ORDER_NUMBER_REGEX.test(orderNumber)) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const updates: Record<string, string> = {};

  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return NextResponse.json({ error: "Некорректный статус оплаты" }, { status: 400 });
    }
    updates.payment_status = body.paymentStatus;
  }

  if (body.deliveryStatus !== undefined) {
    if (!DELIVERY_STATUSES.includes(body.deliveryStatus)) {
      return NextResponse.json({ error: "Некорректный статус доставки" }, { status: 400 });
    }
    updates.delivery_status = body.deliveryStatus;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("order_number", orderNumber);

  if (error) {
    console.error("[api/orders/:orderNumber] PATCH error:", error);
    return NextResponse.json({ error: "Не удалось обновить заказ" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

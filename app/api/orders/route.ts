import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Список всех заказов — только для авторизованного администратора.
 * Содержит персональные данные покупателей (ФИО, телефон, адрес),
 * поэтому публичный доступ закрыт.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, customers(*), order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/orders] GET error:", error);
    return NextResponse.json({ error: "Не удалось загрузить заказы" }, { status: 500 });
  }

  return NextResponse.json({ orders });
}

/**
 * Создание заказа выполняется только через /api/payment/create,
 * где сумма пересчитывается по ценам из БД, а статус оплаты
 * выставляется исключительно вебхуком платёжной системы.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Метод не поддерживается. Используйте /api/payment/create" },
    { status: 405 }
  );
}

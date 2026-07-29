import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Поиск своих заказов по номеру телефона.
 *
 * Сравнение строго по полному нормализованному номеру: частичное совпадение
 * (endsWith) раньше позволяло по короткой строке получить заказы других людей.
 * Персональные данные покупателя в ответе не возвращаются.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawPhone = typeof body?.phone === "string" ? body.phone : "";

    // Нормализуем: только цифры, 8XXXXXXXXXX -> 7XXXXXXXXXX
    const digitsOnly = rawPhone.replace(/\D/g, "").slice(0, 15);
    const digits =
      digitsOnly.startsWith("8") && digitsOnly.length === 11
        ? "7" + digitsOnly.slice(1)
        : digitsOnly;

    // Требуем полный номер — иначе можно перебирать чужие заказы
    if (digits.length < 11) {
      return NextResponse.json({ error: "Укажите полный номер телефона" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Сервис недоступен" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ищем клиента точным совпадением по номеру, а не выгружаем всю таблицу
    const { data: customers, error: custError } = await supabase
      .from("customers")
      .select("id, phone")
      .or(`phone.eq.${digits},phone.eq.+${digits},phone.eq.8${digits.slice(1)}`);

    if (custError) throw custError;

    // Дополнительно сверяем нормализованные цифры — строгое равенство
    const matched = (customers ?? []).filter((c: { id: string; phone: string | null }) => {
      const cDigitsRaw = c.phone?.replace(/\D/g, "") ?? "";
      const cDigits =
        cDigitsRaw.startsWith("8") && cDigitsRaw.length === 11
          ? "7" + cDigitsRaw.slice(1)
          : cDigitsRaw;
      return cDigits === digits;
    });

    if (matched.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const customerIds = matched.map((c: { id: string }) => c.id);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_amount, payment_status, delivery_status, created_at, order_items(*)"
      )
      .in("customer_id", customerIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (ordersError) throw ordersError;

    const mapped = (orders ?? []).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      totalAmount: o.total_amount,
      paymentStatus: o.payment_status,
      deliveryStatus: o.delivery_status,
      createdAt: o.created_at,
      items: (o.order_items ?? []).map((i: any) => ({
        productId: i.product_id ?? null,
        productName: i.product_name,
        quantity: i.quantity,
        price: i.price,
      })),
    }));

    return NextResponse.json({ orders: mapped });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/orders/by-phone] error:", msg);
    return NextResponse.json({ error: "Не удалось загрузить заказы" }, { status: 500 });
  }
}

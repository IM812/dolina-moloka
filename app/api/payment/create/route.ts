import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createPayKeeperInvoice } from "@/lib/paykeeper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, totalAmount } = body;

    if (!customer || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Генерируем номер заказа атомарно через MAX чтобы избежать дублей
    const { data: maxRow } = await supabase
      .from("orders")
      .select("order_number")
      .order("order_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastNum = maxRow?.order_number
      ? parseInt(maxRow.order_number.replace("DM-", ""), 10)
      : 0;
    const orderNum = (isNaN(lastNum) ? 0 : lastNum) + 1;
    const orderNumber = `DM-${String(orderNum).padStart(4, "0")}`;

    // Нормализуем телефон
    const rawPhone: string = customer.phone ?? "";
    const phoneDigits = rawPhone.replace(/\D/g, "");
    const normalizedPhone =
      phoneDigits.startsWith("8") && phoneDigits.length === 11
        ? "7" + phoneDigits.slice(1)
        : phoneDigits;

    // Проверяем UUID
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sanitizedItems = items.map(
      (item: { productId?: string | null; productName: string; quantity: number; price: number }) => ({
        ...item,
        productId: item.productId && UUID_REGEX.test(item.productId) ? item.productId : null,
      })
    );

    // Создаём заказ в БД со статусом pending
    const { data: result, error: rpcError } = await supabase.rpc("create_order", {
      p_full_name: customer.fullName,
      p_phone: normalizedPhone,
      p_email: customer.email || "",
      p_pickup_address: customer.pickupAddress || "",
      p_comment: customer.comment || "",
      p_order_number: orderNumber,
      p_total_amount: totalAmount,
      p_payment_status: "pending",
      p_items: sanitizedItems,
    });

    if (rpcError) throw new Error(rpcError.message);
    const orderId: string = result.orderId;

    // Создаём счёт в PayKeeper
    const { invoiceUrl } = await createPayKeeperInvoice({
      amount: totalAmount,
      orderId,
      orderNumber,
      clientName: customer.fullName,
      clientEmail: customer.email || "",
      clientPhone: normalizedPhone,
      items: items.map((item: { productName: string; price: number; quantity: number }) => ({
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        tax: "none",
      })),
    });

    return NextResponse.json({ orderId, orderNumber, invoiceUrl }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[api/payment/create] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

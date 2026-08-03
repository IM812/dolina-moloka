import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createPayKeeperInvoice } from "@/lib/paykeeper";
import { resolvePickupAddress } from "@/lib/pickup-points";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 50;
const MAX_QTY_PER_PRODUCT = 100;
const MAX_TOTAL_QTY = 300;
const MAX_ORDER_AMOUNT = 500_000;

type IncomingItem = { productId?: unknown; quantity?: unknown };

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    const customer = (body as Record<string, unknown>).customer as
      | Record<string, unknown>
      | undefined;
    const rawItems = (body as Record<string, unknown>).items;

    if (!customer || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Не переданы обязательные поля" }, { status: 400 });
    }
    if (rawItems.length > MAX_ITEMS) {
      return NextResponse.json({ error: "Слишком много позиций в заказе" }, { status: 400 });
    }

    const fullName = str(customer.fullName, 200);
    const email = str(customer.email, 200);
    const comment = str(customer.comment, 1000);
    // Точку выдачи не берём из браузера как есть: восстанавливаем адрес и время
    // из серверного списка по id, чтобы в БД, письме и чеке был один канон.
    const pickupAddress = resolvePickupAddress(
      customer.pickupPointId,
      customer.pickupAddress
    );

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Укажите ФИО" }, { status: 400 });
    }
    if (!pickupAddress) {
      return NextResponse.json(
        { error: "Выберите точку выдачи из списка" },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    // Нормализуем телефон
    const phoneDigits = str(customer.phone, 30).replace(/\D/g, "");
    const normalizedPhone =
      phoneDigits.startsWith("8") && phoneDigits.length === 11
        ? "7" + phoneDigits.slice(1)
        : phoneDigits;
    if (normalizedPhone.length < 11 || normalizedPhone.length > 15) {
      return NextResponse.json({ error: "Некорректный номер телефона" }, { status: 400 });
    }

    // Количество агрегируем по productId, чтобы дубли строк не обходили лимит
    const quantityByProduct = new Map<string, number>();
    let totalQuantity = 0;
    for (const raw of rawItems as IncomingItem[]) {
      const productId = typeof raw?.productId === "string" ? raw.productId : "";
      const quantity = Number(raw?.quantity);
      if (!UUID_REGEX.test(productId)) {
        return NextResponse.json({ error: "Некорректный товар в заказе" }, { status: 400 });
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json({ error: "Некорректное количество" }, { status: 400 });
      }
      const next = (quantityByProduct.get(productId) ?? 0) + quantity;
      if (next > MAX_QTY_PER_PRODUCT) {
        return NextResponse.json({ error: "Превышено количество товара" }, { status: 400 });
      }
      quantityByProduct.set(productId, next);
      totalQuantity += quantity;
    }
    if (totalQuantity > MAX_TOTAL_QTY) {
      return NextResponse.json({ error: "Превышено количество товаров в заказе" }, { status: 400 });
    }

    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Цены и названия берём ТОЛЬКО из БД — данные из браузера игнорируем
    const productIds = [...quantityByProduct.keys()];
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, in_stock")
      .in("id", productIds);

    if (productsError) throw new Error(productsError.message);
    if (!dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: "Некоторые товары недоступны" }, { status: 400 });
    }

    const sanitizedItems: {
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }[] = [];
    let totalAmount = 0;

    for (const product of dbProducts) {
      if (product.in_stock === false) {
        return NextResponse.json(
          { error: `Товар «${product.name}» закончился` },
          { status: 400 }
        );
      }
      const quantity = quantityByProduct.get(product.id)!;
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: "Некорректная цена товара" }, { status: 400 });
      }
      totalAmount += price * quantity;
      sanitizedItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        price,
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;
    if (totalAmount <= 0 || totalAmount > MAX_ORDER_AMOUNT) {
      return NextResponse.json({ error: "Некорректная сумма заказа" }, { status: 400 });
    }

    // Минимальная сумма заказа из настроек магазина
    const { data: minRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "min_order_amount")
      .maybeSingle();
    const minOrder = Number(minRow?.value ?? 0);
    if (Number.isFinite(minOrder) && minOrder > 0 && totalAmount < minOrder) {
      return NextResponse.json(
        { error: `Минимальная сумма заказа — ${minOrder} ₽` },
        { status: 400 }
      );
    }

    // expires_at = +10 минут, после чего заказ автоматически отменяется.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Получаем следующий DM-номер через service role (нужны права на чтение orders)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: lastRow } = await serviceSupabase
      .from("orders")
      .select("order_number")
      .like("order_number", "DM-%")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastNum = lastRow?.order_number
      ? parseInt(lastRow.order_number.replace("DM-", ""), 10)
      : 0;
    const orderNumber = `DM-${String((isNaN(lastNum) ? 0 : lastNum) + 1).padStart(4, "0")}`;

    // Создаём заказ в БД со статусом pending, с DM-номером
    const { data: result, error: rpcError } = await supabase.rpc("create_order", {
      p_full_name: fullName,
      p_phone: normalizedPhone,
      p_email: email,
      p_pickup_address: pickupAddress,
      p_comment: comment,
      p_total_amount: totalAmount,
      p_payment_status: "pending",
      p_order_number: orderNumber,
      p_items: sanitizedItems,
      p_expires_at: expiresAt,
      p_paykeeper_ref: null,
    });

    if (rpcError) throw new Error(rpcError.message);
    const orderId: string = result.orderId;

    // Создаём счёт в PayKeeper — передаём DM-номер как orderid
    const { invoiceUrl } = await createPayKeeperInvoice({
      amount: totalAmount,
      orderId,
      orderNumber,
      clientName: fullName,
      clientEmail: email,
      clientPhone: normalizedPhone,
      items: sanitizedItems.map((item) => ({
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        tax: "vat10",
      })),
    });

    return NextResponse.json(
      { orderId, totalAmount, invoiceUrl, expiresAt },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[api/payment/create] error:", msg);
    return NextResponse.json({ error: "Не удалось создать заказ" }, { status: 500 });
  }
}

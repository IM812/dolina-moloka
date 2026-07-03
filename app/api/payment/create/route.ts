import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { buildPsbForm } from "@/lib/psb-payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, totalAmount } = body;

    if (!customer || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createAnonClient(supabaseUrl, supabaseKey);

    // Generate order number
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const orderNum = (count ?? 0) + 1;
    const orderNumber = `DM-${String(orderNum).padStart(4, "0")}`;

    // Normalize phone
    const rawPhone: string = customer.phone ?? "";
    const phoneDigits = rawPhone.replace(/\D/g, "");
    const normalizedPhone =
      phoneDigits.startsWith("8") && phoneDigits.length === 11
        ? "7" + phoneDigits.slice(1)
        : phoneDigits;

    // Sanitize items
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sanitizedItems = items.map(
      (item: { productId?: string | null; productName: string; quantity: number; price: number }) => ({
        ...item,
        productId:
          item.productId && UUID_REGEX.test(item.productId) ? item.productId : null,
      })
    );

    // Create order in DB with status "pending" — webhook will update to "paid"
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
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? `https://${req.headers.get("host")}`;

    // Build PSB payment form fields
    const formData = buildPsbForm({
      amount: Math.round(totalAmount),
      orderId,
      orderNumber,
      description: `Zakaz ${orderNumber}`,
      email: customer.email || "",
      backref: `${baseUrl}/api/payment/webhook`,
      returnUrl: `${baseUrl}/success?order=${orderNumber}`,
    });

    return NextResponse.json({ orderId, orderNumber, psbForm: formData }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[api/payment/create] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

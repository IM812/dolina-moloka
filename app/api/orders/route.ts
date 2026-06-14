import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { sendOrderNotification } from "@/lib/email";

export async function GET() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, customers(*), order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/orders] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, totalAmount } = body;

    if (!customer || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
    }

    // Use anon supabase-js client — RPC has SECURITY DEFINER so bypasses RLS
    const supabase = createAnonClient(supabaseUrl, supabaseKey);

    // Generate order number
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const orderNum = (count ?? 0) + 1;
    const orderNumber = `DM-${String(orderNum).padStart(4, "0")}`;

    // Normalize phone — strip everything except digits, ensure starts with 7
    const rawPhone: string = customer.phone ?? "";
    const phoneDigits = rawPhone.replace(/\D/g, "");
    const normalizedPhone = phoneDigits.startsWith("8") && phoneDigits.length === 11
      ? "7" + phoneDigits.slice(1)
      : phoneDigits;

    // Sanitize items — productId must be a valid UUID or null
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sanitizedItems = items.map((item: { productId?: string | null; productName: string; quantity: number; price: number }) => ({
      ...item,
      productId: item.productId && UUID_REGEX.test(item.productId) ? item.productId : null,
    }));

    // Single atomic transaction via RPC (SECURITY DEFINER bypasses RLS)
    const { data: result, error: rpcError } = await supabase.rpc("create_order", {
      p_full_name: customer.fullName,
      p_phone: normalizedPhone,
      p_email: customer.email || "",
      p_pickup_address: customer.pickupAddress || "",
      p_comment: customer.comment || "",
      p_order_number: orderNumber,
      p_total_amount: totalAmount,
      p_payment_status: "paid",
      p_items: sanitizedItems,
    });

    if (rpcError) {
      throw new Error(rpcError.message);
    }

    const order = { orderNumber: result.orderNumber, ...result };

    // Send email notification (non-blocking)
    sendOrderNotification({
      id: result.orderId,
      orderNumber,
      customer: { fullName: customer.fullName, phone: customer.phone, email: customer.email, pickupAddress: customer.pickupAddress },
      items,
      totalAmount,
      paymentStatus: "paid",
      deliveryStatus: "new",
      createdAt: new Date().toISOString(),
    } as any).catch((err) => console.error("[api/orders] email notification failed:", err));

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[v0] orders POST catch:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

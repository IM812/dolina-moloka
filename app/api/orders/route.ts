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

    // Use anon supabase-js client — RPC has SECURITY DEFINER so bypasses RLS
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Generate order number
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const orderNum = (count ?? 0) + 1;
    const orderNumber = `DM-${String(orderNum).padStart(4, "0")}`;

    // Single atomic transaction via RPC (SECURITY DEFINER bypasses RLS)
    const { data: result, error: rpcError } = await supabase.rpc("create_order", {
      p_full_name: customer.fullName,
      p_phone: customer.phone,
      p_email: customer.email || "",
      p_pickup_address: customer.pickupAddress || "",
      p_comment: customer.comment || "",
      p_order_number: orderNumber,
      p_total_amount: totalAmount,
      p_payment_status: "paid",
      p_items: items,
    });

    if (rpcError) {
      console.error("[api/orders] RPC error:", rpcError);
      throw rpcError;
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
    console.error("[api/orders] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

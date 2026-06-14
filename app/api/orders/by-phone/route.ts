import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Normalize phone — strip non-digits for comparison
    const digits = phone.replace(/\D/g, "");

    // Find customers with matching phone
    const { data: customers, error: custError } = await supabase
      .from("customers")
      .select("id, phone");

    if (custError) throw custError;

    // Filter by normalized digits match
    const matched = (customers ?? []).filter((c: { id: string; phone: string }) => {
      const cDigits = c.phone?.replace(/\D/g, "") ?? "";
      return cDigits === digits || cDigits.endsWith(digits) || digits.endsWith(cDigits);
    });

    if (matched.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const customerIds = matched.map((c: { id: string }) => c.id);

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("customer_id", customerIds)
      .order("created_at", { ascending: false });

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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();

    // Generate order number based on count
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const orderNum = (count ?? 0) + 1;
    const orderNumber = `DM-${String(orderNum).padStart(4, "0")}`;

    // Insert customer
    const { data: dbCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        full_name: customer.fullName,
        phone: customer.phone,
        email: customer.email || null,
        pickup_address: customer.pickupAddress || null,
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // Insert order
    const { data: dbOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: dbCustomer.id,
        total_amount: totalAmount,
        payment_status: "pending",
        delivery_status: "new",
        comment: customer.comment || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item: { productId: string; productName: string; quantity: number; price: number }) => ({
      order_id: dbOrder.id,
      product_id: item.productId || null,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    const order = { ...dbOrder, orderNumber, customer: dbCustomer, items };

    // Send email notification (non-blocking)
    sendOrderNotification({
      id: dbOrder.id,
      orderNumber,
      customer: { fullName: customer.fullName, phone: customer.phone, email: customer.email, pickupAddress: customer.pickupAddress },
      items,
      totalAmount,
      paymentStatus: "pending",
      deliveryStatus: "new",
      createdAt: dbOrder.created_at,
    } as any).catch((err) => console.error("[api/orders] email notification failed:", err));

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[api/orders] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

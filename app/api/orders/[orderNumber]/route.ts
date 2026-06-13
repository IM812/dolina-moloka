import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(*), order_items(*)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Map to app format
  const order = {
    id: data.id,
    orderNumber: data.order_number,
    customer: {
      fullName: data.customers?.full_name ?? "",
      phone: data.customers?.phone ?? "",
      email: data.customers?.email ?? "",
      pickupAddress: data.customers?.pickup_address ?? "",
    },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;
  const supabase = await createClient();
  const body = await req.json();

  const updates: Record<string, string> = {};
  if (body.paymentStatus) updates.payment_status = body.paymentStatus;
  if (body.deliveryStatus) updates.delivery_status = body.deliveryStatus;

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("order_number", orderNumber);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

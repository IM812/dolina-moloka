import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// DELETE /api/admin/customers/[id] — delete customer + all their orders + items
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // Get all orders for this customer
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_id", id);

    if (orders && orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      await supabase.from("order_items").delete().in("order_id", orderIds);
      await supabase.from("orders").delete().eq("customer_id", id);
    }

    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/customers DELETE]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getMockOrderByNumber } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  // TODO: Replace with real DB query: await db.select().from(orders).where(eq(orders.orderNumber, orderNumber))
  const order = getMockOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

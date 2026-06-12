import { NextRequest, NextResponse } from "next/server";
import {
  getMockOrders,
  addMockOrder,
  generateOrderNumber,
} from "@/lib/mock-data";
import { Order } from "@/types";
import { sendOrderNotification } from "@/lib/email";

export async function GET() {
  // TODO: Replace with real DB query: await db.select().from(orders).orderBy(desc(orders.createdAt))
  const orders = getMockOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, totalAmount } = body;

    if (!customer || !items || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();

    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      customer,
      items,
      totalAmount,
      paymentStatus: "pending",
      deliveryStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    // TODO: Replace with real DB insert: await db.insert(orders).values(order)
    addMockOrder(order);

    // Send email notification (non-blocking — don't fail the request if email fails)
    sendOrderNotification(order).catch((err) =>
      console.error("[api/orders] email notification failed:", err)
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[api/orders] POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

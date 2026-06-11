import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/payment/mock-payment";
import { getMockOrderByNumber, updateMockOrderStatus } from "@/lib/mock-data";
import { sendPaidOrderEmail } from "@/lib/email/send-paid-order-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber is required" },
        { status: 400 }
      );
    }

    const order = getMockOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await createPayment({
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      currency: "RUB",
      description: `Заказ ${order.orderNumber} — Долина молока`,
      returnUrl: `${req.nextUrl.origin}/payment?order=${order.orderNumber}`,
      customerEmail: order.customer.email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Payment creation failed" },
        { status: 500 }
      );
    }

    // Mock: mark as paid immediately (in real flow, status is set by webhook after redirect)
    const updatedOrder = updateMockOrderStatus(orderNumber, "paid");

    if (updatedOrder) {
      await sendPaidOrderEmail(updatedOrder);
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      orderNumber,
    });
  } catch (error) {
    console.error("[api/payment/create] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

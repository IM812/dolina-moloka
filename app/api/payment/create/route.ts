import { NextRequest, NextResponse } from "next/server";

/**
 * Simulates payment processing.
 * In production: integrate ЮKassa / CloudPayments here.
 * The order is NOT saved to DB here — only after this returns success
 * does the client call POST /api/orders to persist it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Simulate payment gateway delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // In production: call ЮKassa / CloudPayments API and return redirect URL
    // For demo: always succeed
    return NextResponse.json({
      success: true,
      paymentId: `demo_${Date.now()}`,
    });
  } catch (error) {
    console.error("[api/payment/create] error:", error);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}

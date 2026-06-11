import { NextRequest, NextResponse } from "next/server";
import { processPaymentWebhook } from "@/lib/payment/mock-payment";
import { updateMockOrderStatus, getMockOrderByNumber } from "@/lib/mock-data";
import { sendPaidOrderEmail } from "@/lib/email/send-paid-order-email";

/**
 * Payment provider webhook endpoint.
 * ЮKassa sends POST to this URL when payment status changes.
 *
 * Production setup:
 * - Configure webhook URL in ЮKassa/CloudPayments dashboard
 * - Verify HMAC signature from X-Hmac-SHA256 header
 * - Idempotency: check if order already processed before updating
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Verify webhook signature for ЮKassa:
    // const signature = req.headers.get('X-Hmac-SHA256');
    // verifyYuKassaSignature(body, signature, process.env.YUKASSA_SECRET_KEY);

    const payload = await req.json();

    const result = await processPaymentWebhook(payload);

    if (result.success && result.status === "paid") {
      updateMockOrderStatus(result.orderNumber, "paid");

      const order = getMockOrderByNumber(result.orderNumber);
      if (order) {
        await sendPaidOrderEmail(order);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[api/payment/webhook] error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

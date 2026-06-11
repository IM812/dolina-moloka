import { Order, PaymentStatus } from "@/types";

export interface PaymentCreatePayload {
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  customerEmail: string;
}

export interface PaymentCreateResult {
  success: boolean;
  paymentId?: string;
  confirmationUrl?: string;
  error?: string;
}

export interface PaymentWebhookPayload {
  event: string;
  paymentId: string;
  orderNumber: string;
  status: PaymentStatus;
}

/**
 * Mock payment creation.
 * Replace with real ЮKassa / CloudPayments SDK call.
 *
 * @example ЮKassa:
 * // const { YooCheckout } = require('@a2seven/yoo-checkout');
 * // const checkout = new YooCheckout({ shopId: process.env.YUKASSA_SHOP_ID, secretKey: process.env.YUKASSA_SECRET_KEY });
 * // const payment = await checkout.createPayment({ amount: { value: amount, currency }, ... });
 */
export async function createPayment(
  payload: PaymentCreatePayload
): Promise<PaymentCreateResult> {
  console.log("[payment] Creating mock payment for order:", payload.orderNumber);

  // TODO: Integrate ЮKassa or CloudPayments here
  const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return {
    success: true,
    paymentId: mockPaymentId,
    confirmationUrl: `/payment?order=${payload.orderNumber}`,
  };
}

/**
 * Mock payment confirmation (simulate successful payment).
 */
export async function confirmMockPayment(order: Order): Promise<{
  success: boolean;
  newStatus: PaymentStatus;
}> {
  console.log("[payment] Confirming mock payment for order:", order.orderNumber);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    newStatus: "paid",
  };
}

/**
 * Process incoming payment webhook.
 * In production: verify signature, then update order status.
 */
export async function processPaymentWebhook(
  payload: PaymentWebhookPayload
): Promise<{ success: boolean; orderNumber: string; status: PaymentStatus }> {
  console.log("[payment] Webhook received:", payload);
  // TODO: Verify ЮKassa/CloudPayments signature
  // TODO: Update database record
  return {
    success: true,
    orderNumber: payload.orderNumber,
    status: payload.status,
  };
}

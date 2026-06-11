import { Order } from "@/types";

/**
 * Sends a confirmation email for a paid order.
 * Currently a mock — replace the body with a real SMTP / Resend / SendGrid call.
 *
 * @example
 * // Future implementation with Resend:
 * // import { Resend } from 'resend';
 * // const resend = new Resend(process.env.RESEND_API_KEY);
 * // await resend.emails.send({ from: '...', to: order.customer.email, ... });
 *
 * @example
 * // Future implementation with Nodemailer / SMTP:
 * // const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, ... });
 * // await transporter.sendMail({ from: '...', to: order.customer.email, ... });
 */
export async function sendPaidOrderEmail(order: Order): Promise<void> {
  if (order.paymentStatus !== "paid") {
    console.warn(
      "[email] sendPaidOrderEmail called with non-paid order:",
      order.orderNumber
    );
    return;
  }

  // TODO: Replace with real email sending (Resend, SendGrid, Nodemailer)
  console.log("[email] Sending paid order confirmation email");
  console.log("[email] To:", order.customer.email);
  console.log("[email] Order number:", order.orderNumber);
  console.log("[email] Total amount:", order.totalAmount, "₽");
  console.log("[email] Items:", order.items);

  // Mock delay to simulate async send
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log(
    "[email] Email sent successfully (mock) to",
    order.customer.email
  );
}

import { Resend } from "resend";
import type { Order } from "@/types";

function formatOrderEmailHtml(order: Order): string {
  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe3;">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe3;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0ebe3;text-align:right;">${(item.price * item.quantity).toLocaleString("ru-RU")} ₽</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <div style="background:#1a1a1a;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Долина молока</h1>
        <p style="color:#aaa;margin:4px 0 0;font-size:13px;">Новый заказ #${order.orderNumber}</p>
      </div>
      <div style="background:#fdfaf6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #f0ebe3;border-top:none;">

        <h2 style="margin:0 0 12px;font-size:15px;">Покупатель</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tr><td style="color:#888;padding:4px 0;width:140px;">Имя</td><td style="font-weight:600;">${order.customer.fullName}</td></tr>
          <tr><td style="color:#888;padding:4px 0;">Телефон</td><td>${order.customer.phone}</td></tr>
          ${order.customer.email ? `<tr><td style="color:#888;padding:4px 0;">Email</td><td>${order.customer.email}</td></tr>` : ""}
          <tr><td style="color:#888;padding:4px 0;">Адрес</td><td>${order.customer.pickupAddress}</td></tr>
          ${order.customer.comment ? `<tr><td style="color:#888;padding:4px 0;">Комментарий</td><td>${order.customer.comment}</td></tr>` : ""}
        </table>

        <h2 style="margin:0 0 12px;font-size:15px;">Состав заказа</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <thead>
            <tr style="background:#f0ebe3;">
              <th style="padding:8px 12px;text-align:left;font-weight:600;">Товар</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;">Кол-во</th>
              <th style="padding:8px 12px;text-align:right;font-weight:600;">Сумма</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="text-align:right;font-size:18px;font-weight:700;border-top:2px solid #f0ebe3;padding-top:12px;">
          Итого: ${order.totalAmount.toLocaleString("ru-RU")} ₽
        </div>

        <p style="margin-top:24px;color:#aaa;font-size:12px;">
          Дата заказа: ${new Date(order.createdAt).toLocaleString("ru-RU")}
        </p>
      </div>
    </div>`;
}

export async function sendOrderNotification(order: Order): Promise<void> {
  const to = process.env.NOTIFICATION_EMAIL ?? "inevolin228@mail.ru";

  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping notification");
    return;
  }

  console.log(`[email] Sending order #${order.orderNumber} → ${to}`);

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "Долина молока <onboarding@resend.dev>",
    to,
    subject: `Новый заказ #${order.orderNumber} — ${order.customer.fullName}`,
    html: formatOrderEmailHtml(order),
  });

  if (error) {
    console.error("[email] Resend error:", JSON.stringify(error));
    throw new Error(String(error));
  }

  console.log(`[email] Sent OK — id: ${data?.id}`);
}

import nodemailer from "nodemailer";
import { Order } from "@/types";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false", // true by default (SSL/TLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatOrderEmailHtml(order: Order): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.productName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${(item.price * item.quantity).toLocaleString("ru-RU")} ₽</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Новый заказ</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;background:#fff;max-width:600px;margin:0 auto;padding:24px;">
  <div style="border-bottom:2px solid #6FA9FF;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0;font-size:22px;color:#111;">Долина молока</h1>
    <p style="margin:4px 0 0;color:#888;font-size:13px;">Новый заказ #${order.orderNumber}</p>
  </div>

  <h2 style="font-size:16px;margin-bottom:12px;">Данные покупателя</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
    <tr><td style="padding:5px 0;color:#888;width:140px;">Имя</td><td style="padding:5px 0;font-weight:600;">${order.customer.fullName}</td></tr>
    <tr><td style="padding:5px 0;color:#888;">Телефон</td><td style="padding:5px 0;">${order.customer.phone}</td></tr>
    <tr><td style="padding:5px 0;color:#888;">Email</td><td style="padding:5px 0;">${order.customer.email ?? "—"}</td></tr>
    <tr><td style="padding:5px 0;color:#888;">Адрес</td><td style="padding:5px 0;">${order.customer.pickupAddress ?? "—"}</td></tr>
    ${order.customer.comment ? `<tr><td style="padding:5px 0;color:#888;">Комментарий</td><td style="padding:5px 0;">${order.customer.comment}</td></tr>` : ""}
  </table>

  <h2 style="font-size:16px;margin-bottom:12px;">Состав заказа</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="padding:8px 12px;text-align:left;font-weight:600;">Товар</th>
        <th style="padding:8px 12px;text-align:center;font-weight:600;">Кол-во</th>
        <th style="padding:8px 12px;text-align:right;font-weight:600;">Сумма</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="text-align:right;font-size:18px;font-weight:700;border-top:2px solid #eee;padding-top:12px;">
    Итого: ${order.totalAmount.toLocaleString("ru-RU")} ₽
  </div>

  <p style="margin-top:24px;font-size:12px;color:#aaa;">
    Заказ создан: ${new Date(order.createdAt).toLocaleString("ru-RU")}
  </p>
</body>
</html>`;
}

export async function sendOrderNotification(order: Order): Promise<void> {
  const to = process.env.SMTP_TO;
  if (!to || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[email] SMTP env vars not configured — skipping notification");
    return;
  }

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Долина молока" <${process.env.SMTP_USER}>`,
    to,
    subject: `Новый заказ #${order.orderNumber} — ${order.customer.fullName}`,
    html: formatOrderEmailHtml(order),
  });
}

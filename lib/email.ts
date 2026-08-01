import nodemailer from "nodemailer";
import type { Order } from "@/types";
import { createServiceClient } from "@/lib/supabase/service";

// ── SMTP config loaded from `settings` table ──────────────────────────────────
type SmtpConfig = { host: string; port: number; user: string; pass: string; to: string };
let _cachedConfig: SmtpConfig | null = null;
let _cachedAt = 0;
const CACHE_TTL = 60_000; // 60 seconds

async function loadSmtpConfig(): Promise<SmtpConfig | null> {
  if (_cachedConfig && Date.now() - _cachedAt < CACHE_TTL) return _cachedConfig;
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("settings").select("key, value");
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    if (!map.smtp_user || !map.smtp_pass) return null;
    _cachedConfig = {
      host: map.smtp_host ?? "smtp.mail.ru",
      port: parseInt(map.smtp_port ?? "465", 10),
      user: map.smtp_user,
      pass: map.smtp_pass,
      to:   map.smtp_to ?? map.smtp_user,
    };
    _cachedAt = Date.now();
    return _cachedConfig;
  } catch (e) {
    console.error("[email] Failed to load SMTP config from DB:", e);
    // Сбрасываем кэш, чтобы следующий вызов снова попробовал загрузить конфиг
    _cachedConfig = null;
    _cachedAt = 0;
    return null;
  }
}

export function invalidateSmtpCache() {
  _cachedConfig = null;
  _cachedAt = 0;
}

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
  const cfg = await loadSmtpConfig();
  if (!cfg) {
    console.warn("[email] SMTP not configured in DB — skipping notification");
    return;
  }

  console.log(`[email] Config loaded — host:${cfg.host} port:${cfg.port} user:${cfg.user} to:${cfg.to}`);

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    requireTLS: cfg.port === 587,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 20000,
    socketTimeout: 20000,
    greetingTimeout: 10000,
  });

  console.log(`[email] Sending order #${order.orderNumber} → ${cfg.to}`);

  const info = await transporter.sendMail({
    from: `"Долина молока" <${cfg.user}>`,
    to: cfg.to,
    subject: `Новый заказ #${order.orderNumber} — ${order.customer.fullName}`,
    html: formatOrderEmailHtml(order),
  });
  console.log(`[email] Sent OK — messageId: ${info.messageId}`);
}

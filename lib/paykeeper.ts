import crypto from "crypto";

const PK_SERVER = process.env.PAYKEEPER_SERVER ?? "https://dolinamoloka.server.paykeeper.ru";
const PK_USER = process.env.PAYKEEPER_USER ?? "";
const PK_PASSWORD = process.env.PAYKEEPER_PASSWORD ?? "";

function getAuthHeader() {
  const token = Buffer.from(`${PK_USER}:${PK_PASSWORD}`).toString("base64");
  return `Basic ${token}`;
}

function getServer() {
  // Убираем trailing slash если есть
  return PK_SERVER.replace(/\/$/, "");
}

export interface PayKeeperInvoiceParams {
  amount: number;          // в рублях
  orderId: string;         // наш UUID из БД
  orderNumber: string;     // DM-0001
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    tax: string;           // "vat0" | "none" | "vat20" etc
  }>;
}

export interface PayKeeperInvoiceResult {
  invoiceUrl: string;      // URL куда редиректить пользователя
  invoiceId: string;
}

export async function createPayKeeperInvoice(
  params: PayKeeperInvoiceParams
): Promise<PayKeeperInvoiceResult> {
  const server = getServer();
  const auth = getAuthHeader();

  // Шаг 1: получаем security token
  const tokenRes = await fetch(`${server}/info/settings/token/`, {
    headers: { Authorization: auth, "Content-Type": "application/json" },
  });
  if (!tokenRes.ok) {
    throw new Error(`PayKeeper: не удалось получить токен (${tokenRes.status})`);
  }
  const tokenData = await tokenRes.json();
  const securityToken: string = tokenData.token;

  // Шаг 2: формируем корзину (для фискального чека)
  const cart = params.items.map((item) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    sum: parseFloat((item.price * item.quantity).toFixed(2)),
    tax: item.tax,
  }));

  // Шаг 3: preview — создаём счёт
  const formData = new URLSearchParams();
  formData.append("pay_amount", params.amount.toFixed(2));
  formData.append("clientid", params.clientName);
  formData.append("orderid", params.orderNumber);
  formData.append("client_email", params.clientEmail);
  formData.append("client_phone", params.clientPhone);
  formData.append("cart", JSON.stringify(cart));
  formData.append("token", securityToken);
  // Передаём наш UUID чтобы в webhook найти заказ
  formData.append("service_name", `${params.orderNumber}|${params.orderId}`);

  const previewRes = await fetch(`${server}/change/invoice/preview/`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!previewRes.ok) {
    const text = await previewRes.text();
    throw new Error(`PayKeeper: ошибка preview (${previewRes.status}): ${text}`);
  }

  const previewData = await previewRes.json();
  const invoiceId: string = String(previewData.invoice_id ?? previewData.id ?? "");
  if (!invoiceId) throw new Error("PayKeeper: не вернул invoice_id");

  // Шаг 4: send — подтверждаем счёт
  const sendForm = new URLSearchParams();
  sendForm.append("id", invoiceId);
  sendForm.append("token", securityToken);

  const sendRes = await fetch(`${server}/change/invoice/send/`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: sendForm.toString(),
  });

  if (!sendRes.ok) {
    const text = await sendRes.text();
    throw new Error(`PayKeeper: ошибка send (${sendRes.status}): ${text}`);
  }

  // URL платёжной формы
  const invoiceUrl = `${server}/pay.html?id=${invoiceId}`;

  return { invoiceUrl, invoiceId };
}

/**
 * Проверка подписи уведомления от PayKeeper.
 * key = MD5(id + sum + clientid + orderid + SECRET_SEED)
 */
export function verifyPayKeeperNotification(data: Record<string, string>): boolean {
  const secret = process.env.PAYKEEPER_SECRET ?? "";
  const expected = crypto
    .createHash("md5")
    .update(`${data.id}${data.sum}${data.clientid}${data.orderid}${secret}`)
    .digest("hex");
  return data.key === expected;
}

/**
 * Формирует ответ PayKeeper: "OK md5(id + SECRET_SEED)"
 */
export function buildPayKeeperResponse(id: string): string {
  const secret = process.env.PAYKEEPER_SECRET ?? "";
  const hash = crypto
    .createHash("md5")
    .update(`${id}${secret}`)
    .digest("hex");
  return `OK ${hash}`;
}

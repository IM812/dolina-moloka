import crypto from "crypto";

const PK_SERVER = process.env.PAYKEEPER_SERVER ?? "https://dolinamoloka.server.paykeeper.ru";
const PK_USER = process.env.PAYKEEPER_USER ?? "admin";
const PK_PASSWORD = process.env.PAYKEEPER_PASSWORD ?? "Dm_502026";
const PK_SECRET = process.env.PAYKEEPER_SECRET ?? "}xXwa3]8xUkky88";

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
  // service_name — видимое название услуги (только номер заказа)
  formData.append("service_name", `Заказ ${params.orderNumber}`);
  // Передаём UUID через clientid скрытно не получится, используем orderid для webhook
  // Наш UUID хранится в orderid поля ответа webhook через поле orderid=orderNumber

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

  // PayKeeper возвращает готовый invoice_url в preview — используем его
  const invoiceUrl: string = previewData.invoice_url ?? `${server}/bill/${invoiceId}`;

  return { invoiceUrl, invoiceId };
}

/**
 * Проверка подписи уведомления от PayKeeper.
 * key = MD5(id + sum + clientid + orderid + SECRET_SEED)
 */
export function verifyPayKeeperNotification(data: Record<string, string>): boolean {
  const expected = crypto
    .createHash("md5")
    .update(`${data.id}${data.sum}${data.clientid}${data.orderid}${PK_SECRET}`)
    .digest("hex");
  return data.key === expected;
}

/**
 * Формирует ответ PayKeeper: "OK md5(id + SECRET_SEED)"
 */
export function buildPayKeeperResponse(id: string): string {
  const hash = crypto
    .createHash("md5")
    .update(`${id}${PK_SECRET}`)
    .digest("hex");
  return `OK ${hash}`;
}

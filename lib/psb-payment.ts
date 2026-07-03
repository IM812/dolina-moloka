import { createHash } from "crypto";

// ПСБ (Промсвязьбанк) Internet Acquiring integration
// Protocol: ISO 8583 / e-comm gateway at 3ds.payment.ru

export const PSB_URL = "https://3ds.payment.ru/cgi-bin/cgi_link";
export const CURRENCY = "643"; // RUB

// MAC (P_SIGN) is MD5 of concatenated field values separated by ";"
// Empty fields MUST be included as "-" per PSB spec
function macValue(v: string | number | undefined | null): string {
  const s = v === undefined || v === null ? "" : String(v);
  return s.trim() === "" ? "-" : s.trim();
}

const PSB_KEY_DEFAULT = "1BB6E24A8EF87FEEC30D95C6F98338C5";
const PSB_TERMINAL_DEFAULT = "30702337";
const PSB_MERCHANT_DEFAULT = "000545130702337";
const PSB_MERCH_NAME_DEFAULT = "DOLINA MOLOKA";
const SITE_URL_DEFAULT = "https://xn--80aakqldchhhfb.xn--p1ai";

export function buildPSign(fields: Record<string, string>): string {
  const key = process.env.PSB_KEY ?? PSB_KEY_DEFAULT;
  if (!key) throw new Error("PSB_KEY env var is not set");

  const order = [
    "AMOUNT", "CURRENCY", "ORDER", "DESC", "MERCH_NAME", "MERCHANT",
    "TERMINAL", "EMAIL", "TRTYPE", "TIMESTAMP", "NONCE", "BACKREF",
  ];

  const mac = order.map((f) => macValue(fields[f])).join(";");
  const keyBuf = Buffer.from(key, "hex");

  // HMAC using raw key bytes — ПСБ uses MAC = MD5(hex_key XOR ... actually plain MAC)
  // Per ПСБ spec: P_SIGN = MAC = MD5( KEY || ";" || MAC_string )
  // Но фактически: MAC = MD5 от конкатенации с ключом через ipad/opad не используется.
  // ПСБ spec: sign = MD5(hex(key) + ";" + value_string) — нет, используем:
  // P_SIGN = lower_hex( MD5( MAC_string + KEY_hex ) )
  // Официально: MAC = hex(MD5(pack key + message)) — используем HMAC-MD5 with raw key
  const hmac = require("crypto").createHmac("md5", keyBuf);
  hmac.update(mac);
  return hmac.digest("hex").toUpperCase();
}

export function generateNonce(): string {
  return require("crypto").randomBytes(16).toString("hex").toUpperCase();
}

export function generateTimestamp(): string {
  // Format: YYMMDDHHmmss
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    String(now.getUTCFullYear()).slice(2) +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds())
  );
}

export function generateOrderId(): string {
  // ПСБ ORDER: до 6 символов, уникальный
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return ts;
}

export interface PsbPaymentParams {
  amount: number;       // в рублях (число, например 930 → отправится как "930.00")
  orderId: string;      // внутренний ID заказа в БД
  orderNumber: string;  // номер заказа DM-XXXX
  description: string;
  email: string;
  backref: string;      // URL для уведомления от ПСБ
  returnUrl: string;    // URL для редиректа пользователя после оплаты
}

export interface PsbFormData {
  fields: Record<string, string>;
  url: string;
}

export function buildPsbForm(params: PsbPaymentParams): PsbFormData {
  const psbOrder = generateOrderId();
  // ПСБ ожидает AMOUNT в формате "930.00" (рубли.копейки)
  const amount = params.amount.toFixed(2);
  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  const terminal = process.env.PSB_TERMINAL ?? PSB_TERMINAL_DEFAULT;
  const merchant = process.env.PSB_MERCHANT ?? PSB_MERCHANT_DEFAULT;
  const merchName = process.env.PSB_MERCH_NAME ?? PSB_MERCH_NAME_DEFAULT;

  const fields: Record<string, string> = {
    AMOUNT: amount,
    CURRENCY: CURRENCY,
    ORDER: psbOrder,
    DESC: params.description.slice(0, 125),
    MERCH_NAME: merchName,
    MERCHANT: merchant,
    TERMINAL: terminal,
    EMAIL: params.email,
    TRTYPE: "1",       // 1 = purchase
    TIMESTAMP: timestamp,
    NONCE: nonce,
    BACKREF: params.backref,
  };

  // Extra fields not included in P_SIGN
  fields.MERCH_URL = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_DEFAULT;
  fields.MERCH_GMT = "+3";
  fields.LANG = "RU";
  fields.ADDINFO = params.orderId;
  fields.TRTYPE = "1";

  fields.P_SIGN = buildPSign(fields);

  // Success/fail redirect URLs (not signed, added after P_SIGN)
  fields.URL = params.returnUrl;
  fields.FAILURL = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_DEFAULT) + "/fail";

  return { fields, url: PSB_URL };
}

// Verify BACKREF notification from PSB
export function verifyPsbNotification(data: Record<string, string>): boolean {
  try {
    const order = [
      "AMOUNT", "CURRENCY", "ORDER", "DESC", "MERCH_NAME", "MERCHANT",
      "TERMINAL", "EMAIL", "TRTYPE", "TIMESTAMP", "NONCE", "BACKREF",
    ];
    const mac = order.map((f) => macValue(data[f])).join(";");
    const keyBuf = Buffer.from(process.env.PSB_KEY ?? "", "hex");
    const hmac = require("crypto").createHmac("md5", keyBuf);
    hmac.update(mac);
    const expected = hmac.digest("hex").toUpperCase();
    return expected === (data.P_SIGN ?? "").toUpperCase();
  } catch {
    return false;
  }
}

/**
 * Nanokassa fiscalization library.
 * Implements double AES-256-CTR + RSA-4096-OAEP encryption per Nanokassa API spec.
 * Uses Node.js built-in `crypto` module — no external dependencies required.
 */

import crypto from "crypto";

// ─── Public keys from https://nanokassa.ru/integration/documentation/publichnye-rsa-klyuchi/ ───

// First encryption key (internet shop → nanokassa.ru server)
const RSA_KEY_1 = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwFXHnzc5YKj8e3tlNzST
CkA8Tq4gjTH0VMuhJhg5QWpFjFKwtnK3u4EOaQGmjqDtzyffVHmKuGikg9jE20sG
nJN4hTtySihOiUWRd4zhJVMevBQmsEQS33bg26UzzKCeO12mbM/Q4ip7YXEfWM/F
Tq2l94psQgmIDh/LtHVf3OBlz8I6u5VaP3AS0Hv9RBUin0RBkRUC+5tgURm382XT
nJ2GzZ8cEGJm3C+s0+W1N2igjV0X3MihylHGDyl+8FpbFIlXsaJOYQ0//JIgnaBz
MV2JyNTHBzPJrcIMHIbKBVAmDLfgeDNKug7wIadEcqoJaCz74yG9l9nJWISWQkI6
Ed8nDVsoaIkMQBuWWxfHjQEU8R8OVjRzhOGHPG2ka6y1/jcOS5JWPzS5YVXRPbrh
QYcoNebsOBaFxJYZ2E7VhVdrGWlBqhANFba7umZXVOvmDXIsH974Yv4awAaP70VP
SLFIdjiNy/SB8w0O8PJOUPznpMhvi1clBgp3PvtYmhUqmdHWPwjcjy0JmY9KrWz0
0Im1yDTTybtV3uYnwR677TmsLmR9c6T7EHlT3gG6Y0bM3w9tyrGqVKy1jIkyUZPV
f0dmXTfbh+hcC5kYal+M7lcn7wSSLHTUk+C/YWE1e5TvTBK6teU2VNmz80Yt2IS2
mcXlfKlZXilMmPJCdUI7nNMCAwEAAQ==
-----END PUBLIC KEY-----`;

// Second encryption key (nanokassa.ru server → cashbox server)
const RSA_KEY_2 = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA+fu+NGlnWAXqIVgEL37v
eatlyooYi+iHLiBmCDowNZUBAiQ+pvbnzkowUKdr86lGrzQLCAvVyXWG0U4kdixA
X0GTkIR/3g3h2/8hRx0x3K0umT+tcZC3iJytKzP+EM/B6sDdw6/URbykwvrAlbQs
G9d6eCqq0F/6muOM3gQazy8CuHyx4iFQpml4E1/IQgp3tZJOX5I9xieHTUwct2Ok
URCKYnHJZrRIN9rwXQkNG1q+M8HDqI1Mwq88wieVC+SUuoPc8F0MlIWs2zwDhLcX
84OQTRFqlW3NFR/6kUn3TIC1JZD1Ft/8fWukZzAFsAmdXmFzhBUuBPvjIzzLafY3
f8IszADMnloJ0BW3iGVRGj6hygX7Jpr/86LPHu6PBJzHzCp9bnfOiSjRENzzy55f
DdVbYpVgWDt4+UEkl9qNRNuiSMDpKeVNy6jxbihZneYCR8alnH8Olh6lL7bmGdww
qI9LSyq/qFfIMDV8onit/dLxzypFJofRfjZ1Dc8ZEqh2sab8qEMNPGQwTM/FVFWM
bq0hmjjY+BFWGY/h0z1NZMX75Uzyd9OdXaRoTlHPfOxxAIfclP2XY2K8f5PQ37g/
fX2R8bw/fXQd2ndi/+uPCGK92Xw4/3/osJKpm3QSYhSda53T9Ddned7BtWDQJqdV
Y/SUskwLLyjtSb0LqsSKBHkCAwEAAQ==
-----END PUBLIC KEY-----`;

// HMAC-SHA512 keys (base64-encoded) for integrity check
const HMAC_KEY_1_B64 = "BBuXaXBdHg+wLPjRJpf3N/NmLq5kuvzGQx3II15/j8o=";
const HMAC_KEY_2_B64 = "aFZP3PbvrMZNNxxqJxaCnCLama5L8H1/YGO3UYsoCVQ=";

const NANOKASSA_ENDPOINT = "http://q.nanokassa.ru/srv/igd.php";

// ─── Tax system codes ───
export const TAX_SYSTEMS: Record<string, string> = {
  "1": "ОСН",
  "2": "УСН доход",
  "3": "УСН доход-расход",
  "4": "ЕСХН",
  "5": "ЕНВД",
  "6": "ПСН",
};

// ─── VAT rate codes (stavka_nds) ───
// Официальный перечень Nanokassa: 1—20%, 2—10%, 3—20/120, 4—10/110,
// 5—0%, 6—без НДС, 7—5%, 8—7%, 9—5/105, 10—7/107, 11—22%, 12—22/122
export const VAT_RATES: Record<string, string> = {
  "2": "НДС 10%",
  "1": "НДС 20%",
  "5": "НДС 0%",
  "6": "Без НДС",
  "4": "НДС 10/110",
  "3": "НДС 20/120",
  "7": "НДС 5%",
  "8": "НДС 7%",
};

/** Ставка НДС по умолчанию — 10% (молочная продукция) */
export const DEFAULT_VAT_RATE = "2";

// ─── Payment subject (priznak_predmeta_rascheta) ───
export const PAYMENT_SUBJECTS: Record<string, string> = {
  "1": "Товар",
  "4": "Услуга",
  "5": "Работа",
};

// ─── Payment method (priznak_sposoba_rascheta) ───
export const PAYMENT_METHODS: Record<string, string> = {
  "4": "Полная оплата",
  "1": "Предоплата 100%",
  "3": "Аванс",
  "7": "Полный расчёт",
};

// ─── Nanokassa settings shape ───
export interface NanokassaSettings {
  kassaId: string;
  kassaToken: string;
  testMode: boolean;          // true = тест, false = боевой
  taxSystem: string;          // "2" = УСН доход и т.д.
  vatRate: string;            // "2" = НДС 10%, "1" = НДС 20%, "6" = без НДС
  paymentSubject: string;     // "1" = товар
  paymentMethod: string;      // "4" = полная оплата
  enabled: boolean;
  // Вендинг (обязательно для касс типа "Вендинг")
  vendingEnabled?: boolean;   // true = добавлять поля вендинга
  vendAddress?: string;       // адрес установки (тег 1009)
  vendPlace?: string;         // место расчёта (тег 1187)
  vendNumber?: string;        // номер автомата (тег 1036)
}

// ─── Request shape ───
export interface NanokassaReceiptItem {
  name: string;
  price: number;   // в копейках
  quantity: number;
  sum: number;     // в копейках
}

export interface NanokassaReceiptParams {
  settings: NanokassaSettings;
  orderId: string;           // для rid
  clientEmail: string;
  clientPhone: string;
  items: NanokassaReceiptItem[];
  totalKopecks: number;      // итог в копейках
}

// ─── Encryption helpers ───

/**
 * Encrypt with AES-256-CTR + HMAC-SHA512.
 * Output layout: [64 bytes HMAC] + [16 bytes IV] + [N bytes ciphertext] → base64
 */
function aesEncryptWithHmac(plaintext: string, hmacKeyB64: string): { de: string; pw: Buffer } {
  const pw = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const hmacKey = Buffer.from(hmacKeyB64, "base64");

  const cipher = crypto.createCipheriv("aes-256-ctr", pw, iv);
  const enc1 = cipher.update(Buffer.from(plaintext, "utf8"));
  const enc2 = cipher.final();
  const ciphertext = Buffer.concat([enc1, enc2]);

  const hmac = crypto.createHmac("sha512", hmacKey).update(Buffer.concat([iv, ciphertext])).digest();

  const packet = Buffer.concat([hmac, iv, ciphertext]);
  return { de: packet.toString("base64"), pw };
}

/**
 * Encrypt AES key `pw` with RSA-OAEP (4096-bit public key).
 * Returns base64-encoded ciphertext.
 */
function rsaEncrypt(pw: Buffer, publicKeyPem: string): string {
  const encrypted = crypto.publicEncrypt(
    { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    pw
  );
  return encrypted.toString("base64");
}

// ─── Main send function ───

export async function sendNanokassaReceipt(params: NanokassaReceiptParams): Promise<{
  ok: boolean;
  nuid?: string;
  qnuid?: string;
  error?: string;
  raw?: unknown;
}> {
  const { settings, orderId, clientEmail, clientPhone, items, totalKopecks } = params;

  // ── Build inner JSON payload (the receipt data) ──
  const productsArr = items.map((item) => ({
    name_tovar: item.name,
    price_piece_bez_skidki: item.price,
    skidka: 0,
    kolvo: item.quantity,
    price_piece: item.price,
    summa: item.sum,
    // Валидируем код ставки: неизвестное значение → НДС 10% по умолчанию
    stavka_nds: parseInt(
      VAT_RATES[settings.vatRate] ? settings.vatRate : DEFAULT_VAT_RATE,
      10
    ),
    priznak_sposoba_rascheta: parseInt(settings.paymentMethod, 10),
    priznak_predmeta_rascheta: parseInt(settings.paymentSubject, 10),
    priznak_agenta: "none",
    phone_oper_perevoda: "",
    operation_plat_agenta: "",
    phone_oper_priem_plat: "",
    name_oper_perevoda: "",
    address_oper_perevoda: "",
    inn_oper_perevoda: "",
    phone_postavshika: "",
    name_postavshika: "",
  }));

  const rid = `${new Date().getFullYear()}_${orderId.replace(/[^a-zA-Z0-9]/g, "")}_${crypto.randomBytes(8).toString("hex")}`;

  const innerPayload: Record<string, unknown> = {
    kassaid: settings.kassaId,
    kassatoken: settings.kassaToken,
    cms: "wordpress",
    check_send_type: settings.vendingEnabled ? "none" : "email",
    products_arr: productsArr,
    oplata_arr: {
      rezhim_nalog: settings.taxSystem,
      money_nal: 0,
      money_electro: totalKopecks,
      money_predoplata: 0,
      money_postoplata: 0,
      money_vstrecha: 0,
      kassir_inn: "",
      kassir_fio: "",
      client_email: clientEmail,
      client_phone: clientPhone,
    },
    itog_arr: {
      priznak_rascheta: 1,
      itog_cheka: totalKopecks,
    },
  };

  // ── Вендинг: обязательные поля для касс типа "Вендинг" ──
  if (settings.vendingEnabled) {
    innerPayload.check_vend_address = settings.vendAddress || "";
    innerPayload.check_vend_mesto = settings.vendPlace || "";
    innerPayload.check_vend_num_avtovat = settings.vendNumber || "";
  }

  // ── First encryption ──
  const { de: dePacket, pw: pw1 } = aesEncryptWithHmac(JSON.stringify(innerPayload), HMAC_KEY_1_B64);
  const abPacket = rsaEncrypt(pw1, RSA_KEY_1);

  const firstLayerPayload = {
    ab: abPacket,
    de: dePacket,
    kassaid: settings.kassaId,
    kassatoken: settings.kassaToken,
    check_type: "standart",
    rid,
    test: settings.testMode ? "1" : "0",
  };

  // ── Second encryption ──
  const { de: ddePacket, pw: pw2 } = aesEncryptWithHmac(JSON.stringify(firstLayerPayload), HMAC_KEY_2_B64);
  const aabPacket = rsaEncrypt(pw2, RSA_KEY_2);

  const finalPayload = {
    aab: aabPacket,
    dde: ddePacket,
    test: settings.testMode ? "1" : "0",
  };

  // ── Send ──
  const response = await fetch(NANOKASSA_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(finalPayload),
    signal: AbortSignal.timeout(15_000),
  });

  const raw = await response.json().catch(() => ({ status: "parse_error" }));

  if (raw?.status === "success") {
    return { ok: true, nuid: raw.nuid, qnuid: raw.qnuid, raw };
  }

  return { ok: false, error: JSON.stringify(raw), raw };
}

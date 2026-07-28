import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendNanokassaReceipt, type NanokassaSettings } from "@/lib/nanokassa";

// POST /api/admin/test-receipt
// Отправляет тестовый чек напрямую в Nanokassa и возвращает СЫРОЙ ответ.
// Позволяет проверить подключение кассы без реальной оплаты.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string = body.email || "";
    const phone: string = body.phone || "";

    if (!email && !phone) {
      return NextResponse.json(
        { ok: false, error: "Укажите email или телефон для тестового чека" },
        { status: 400 }
      );
    }

    const sb = createServiceClient();
    const { data: rows, error } = await sb
      .from("settings")
      .select("key, value")
      .in("key", [
        "nanokassa_enabled",
        "nanokassa_id",
        "nanokassa_token",
        "nanokassa_test",
        "nanokassa_tax_system",
        "nanokassa_vat",
        "nanokassa_payment_subject",
        "nanokassa_payment_method",
      ]);

    if (error) {
      return NextResponse.json({ ok: false, error: `Ошибка чтения настроек: ${error.message}` }, { status: 500 });
    }

    const s: Record<string, string> = {};
    for (const row of rows ?? []) s[row.key] = row.value;

    if (!s.nanokassa_id || !s.nanokassa_token) {
      return NextResponse.json(
        { ok: false, error: "Не заполнены ID кассы или токен в настройках" },
        { status: 400 }
      );
    }

    const settings: NanokassaSettings = {
      kassaId: s.nanokassa_id,
      kassaToken: s.nanokassa_token,
      testMode: s.nanokassa_test !== "false", // по умолчанию тест
      taxSystem: s.nanokassa_tax_system ?? "2",
      vatRate: s.nanokassa_vat ?? "6",
      paymentSubject: s.nanokassa_payment_subject ?? "1",
      paymentMethod: s.nanokassa_payment_method ?? "4",
      enabled: true,
    };

    // Минимальный тестовый чек: 1 позиция, 10 руб (1000 копеек)
    const totalKopecks = 1000;
    const items = [
      {
        name: "Тестовый чек (проверка подключения)",
        price: totalKopecks,
        quantity: 1,
        sum: totalKopecks,
      },
    ];

    const started = Date.now();
    let result;
    try {
      result = await sendNanokassaReceipt({
        settings,
        orderId: `TEST-${Date.now()}`,
        clientEmail: email,
        clientPhone: phone,
        items,
        totalKopecks,
      });
    } catch (sendErr: unknown) {
      const e = sendErr as { message?: string; cause?: unknown };
      return NextResponse.json(
        {
          ok: false,
          error: `Не удалось связаться с Nanokassa: ${e.message ?? String(sendErr)}`,
          hint: "Проверьте, что сервер имеет доступ к http://q.nanokassa.ru (белый IP)",
          durationMs: Date.now() - started,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: result.ok,
      testMode: settings.testMode,
      kassaId: settings.kassaId,
      nuid: result.nuid,
      qnuid: result.qnuid,
      error: result.error,
      raw: result.raw,
      durationMs: Date.now() - started,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ ok: false, error: e.message ?? String(err) }, { status: 500 });
  }
}

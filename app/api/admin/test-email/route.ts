import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServiceClient } from "@/lib/supabase/service";
import { invalidateSmtpCache } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { host, port, user, pass, to } = await req.json();

    if (!host || !user || !pass) {
      return NextResponse.json({ ok: false, error: "Заполните хост, email и пароль" }, { status: 400 });
    }

    const portNum = parseInt(port ?? "465", 10);
    const secure = portNum === 465;

    const transporter = nodemailer.createTransport({
      host,
      port: portNum,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Долина молока" <${user}>`,
      to: to || user,
      subject: "Тест уведомлений — Долина молока",
      html: `<p>SMTP настроен успешно. Уведомления о заказах будут приходить на этот адрес.</p>`,
    });

    // Save config to DB so all future order emails use these settings
    const sb = createServiceClient();
    await sb.from("settings").upsert([
      { key: "smtp_host", value: host, updated_at: new Date().toISOString() },
      { key: "smtp_port", value: String(port ?? "465"), updated_at: new Date().toISOString() },
      { key: "smtp_user", value: user, updated_at: new Date().toISOString() },
      { key: "smtp_pass", value: pass, updated_at: new Date().toISOString() },
      { key: "smtp_to",   value: to || user, updated_at: new Date().toISOString() },
    ], { onConflict: "key" });

    // Invalidate in-memory cache so next email uses fresh config
    invalidateSmtpCache();

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; responseCode?: number };
    const msg =
      e.code === "ECONNREFUSED" ? `Нет соединения с сервером (${e.code})` :
      e.code === "ETIMEDOUT"    ? `Таймаут подключения — проверьте хост и порт` :
      e.code === "EAUTH"        ? `Ошибка авторизации — неверный пароль или логин` :
      e.responseCode === 535    ? `Неверный пароль (535)` :
      e.message ?? "Неизвестная ошибка";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

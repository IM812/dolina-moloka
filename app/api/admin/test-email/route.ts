import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

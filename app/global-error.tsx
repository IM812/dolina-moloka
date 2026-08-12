"use client";

import { useEffect } from "react";

// global-error перехватывает крах самого корневого layout (Header/Footer/провайдеры).
// Next.js требует, чтобы этот файл сам рендерил <html> и <body> — родительский
// layout.tsx в этот момент уже не смонтирован. Стили держим инлайновыми и
// без внешних зависимостей (шрифты/иконки), чтобы страница отрисовалась
// даже если само приложение не может собраться.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#f9f7f3",
          color: "#1a1a1a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 420 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🥛</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Не получилось загрузить сайт
          </h1>
          <p style={{ color: "#6b6b6b", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            Произошла временная ошибка. Попробуйте обновить страницу.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "0.75rem 1.75rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}

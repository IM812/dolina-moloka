"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RotateCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логируем на клиенте, чтобы было видно в консоли/аналитике, что именно упало
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="min-h-[70svh] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <div className="relative mb-6">
          <div className="size-20 sm:size-24 rounded-3xl bg-secondary border border-border flex items-center justify-center shadow-sm mx-auto">
            <span className="text-4xl sm:text-5xl">🥛</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
          Не получилось загрузить страницу
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-8 text-pretty">
          Похоже, произошла временная ошибка соединения. Попробуйте обновить
          страницу — обычно это помогает.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="w-full sm:w-auto gap-2 border-border"
          >
            <Home className="size-4" />
            На главную
          </Button>
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <RotateCw className="size-4" />
            Попробовать снова
          </Button>
        </div>
      </div>
    </div>
  );
}

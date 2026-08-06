"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";

const COOKIE_KEY = "dm_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  // Пока баннер на экране, освобождаем под него место снизу, иначе он
  // перекрывает последние элементы страницы и до них нельзя дотронуться.
  useEffect(() => {
    const el = bannerRef.current;
    if (!visible || !el) return;

    const prev = document.body.style.paddingBottom;
    // Измеряем реальную высоту: текст переносится по-разному на разных экранах.
    const sync = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.style.paddingBottom = prev;
    };
  }, [visible]);

  const accept = () => {
    Cookies.set(COOKIE_KEY, "accepted", { expires: 365, sameSite: "Lax" });
    setVisible(false);
  };

  const decline = () => {
    Cookies.set(COOKIE_KEY, "declined", { expires: 30, sameSite: "Lax" });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bannerRef}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          // На мобильном баннер накрывал нижние кнопки страницы («Оформить заказ»),
          // и тап уходил в него. Пока баннер виден, добавляем body отступ снизу
          // (см. useEffect ниже) — контент можно доскроллить выше баннера.
          // pb-[env(safe-area-inset-bottom)] — чтобы не попадать под home-бар iPhone.
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-2 sm:bottom-2 sm:max-w-md"
          role="dialog"
          aria-label="Уведомление о cookies"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-foreground text-sm">
                Мы используем cookies
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Они помогают нам улучшать сайт и запоминать вашу корзину.
                Подробнее в нашей{" "}
                <Link href="/cookies" className="text-primary hover:underline underline-offset-2">
                  политике cookies
                </Link>
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={accept}
                size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 text-xs font-semibold"
              >
                Принять
              </Button>
              <Button
                onClick={decline}
                size="sm"
                variant="outline"
                className="flex-1 rounded-xl h-9 text-xs border-border"
              >
                Отклонить
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";

const COOKIE_KEY = "dm_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

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
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md"
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

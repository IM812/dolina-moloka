"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function FailContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order");

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="size-20 bg-destructive/10 rounded-full flex items-center justify-center"
          >
            <XCircle className="size-10 text-destructive" />
          </motion.div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-foreground">Оплата не прошла</h1>
            {order && (
              <p className="text-sm text-muted-foreground">
                Заказ <span className="font-medium text-foreground">{order}</span>
              </p>
            )}
            <p className="text-muted-foreground text-sm leading-relaxed">
              К сожалению, платёж был отклонён. Возможные причины: недостаточно средств,
              ограничения банка или ошибка при вводе данных карты.
            </p>
          </div>

          <div className="bg-secondary border border-border rounded-xl p-4 text-left w-full">
            <p className="text-sm font-semibold text-foreground mb-2">Возможные причины:</p>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li>— Недостаточно средств на карте</li>
              <li>— Карта заблокирована или истёк срок действия</li>
              <li>— Банк отклонил операцию</li>
              <li>— Ошибка подтверждения 3-D Secure</li>
            </ul>
          </div>

          <div className="bg-secondary border border-border rounded-xl p-4 text-left w-full">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ваш заказ сохранён. Попробуйте оплатить ещё раз или свяжитесь с нами:{" "}
              <a href="tel:+79166950988" className="text-primary font-medium">+7 916 695-09-88</a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/cart" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="size-4" />
                В корзину
              </Button>
            </Link>
            <Link href="/checkout" className="flex-1">
              <Button className="w-full gap-2">
                <RotateCcw className="size-4" />
                Попробовать снова
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}

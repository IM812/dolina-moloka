"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FailPage() {
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
            <p className="text-muted-foreground text-sm leading-relaxed">
              К сожалению, платёж был отклонён. Возможные причины: недостаточно средств,
              ограничения банка или ошибка при вводе данных карты.
            </p>
          </div>

          <div className="bg-secondary border border-border rounded-xl p-4 text-left w-full">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ваш заказ сохранён. Попробуйте оплатить ещё раз или свяжитесь с нами:
              <a href="tel:+79166950988" className="text-primary font-medium ml-1">+7 916 695-09-88</a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/cart" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="size-4" />
                В корзину
              </Button>
            </Link>
            <Link href="/cart" className="flex-1">
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

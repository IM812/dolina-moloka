"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    num: "01",
    title: "Выберите продукты",
    desc: "Свежий ассортимент молочных продуктов с фермы — молоко, творог, кефир, масло и йогурты.",
  },
  {
    num: "02",
    title: "Оформите заказ",
    desc: "Укажите адрес доставки, имя и телефон. Принимаем заказы до 20:00 накануне дня доставки.",
  },
  {
    num: "03",
    title: "Получите у двери",
    desc: "Доставляем каждую среду и субботу. Все продукты едут в холодильных контейнерах.",
  },
];

export function DeliverySection() {
  return (
    <section id="delivery" className="py-12 sm:py-20 md:py-28 overflow-hidden bg-background">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 block">
              Как это работает
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              От фермы — к вашей двери
            </h2>
          </div>
          <div className="shrink-0">
            <Link href="/catalog">
              <Button variant="outline" className="gap-2 rounded-full h-11 px-6 border-foreground/20">
                Перейти к заказу
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden mb-4">
          {steps.map(({ num, title, desc }) => (
            <div
              key={num}
              className="bg-background px-5 py-6 sm:px-8 sm:py-10 flex flex-col gap-3"
            >
              <span className="font-heading text-5xl font-bold text-primary/20 leading-none select-none">
                {num}
              </span>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule + info strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-foreground text-background rounded-2xl px-5 py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-primary shrink-0" />
              <div>
                <p className="font-bold text-sm leading-tight">Среда</p>
                <p className="text-xs text-background/60 mt-0.5">Приём заказов</p>
              </div>
            </div>
            <span className="text-sm font-medium text-background/80">до вторника, 20:00</span>
          </div>
          <div className="flex items-center justify-between bg-foreground text-background rounded-2xl px-5 py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="size-2.5 rounded-full bg-primary shrink-0" />
              <div>
                <p className="font-bold text-sm leading-tight">Суббота</p>
                <p className="text-xs text-background/60 mt-0.5">Приём заказов</p>
              </div>
            </div>
            <span className="text-sm font-medium text-background/80">до пятницы, 20:00</span>
          </div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-primary/8 border border-primary/15 rounded-2xl px-5 py-4">
            <p className="text-sm text-foreground">
              Минимальный заказ — <span className="font-semibold">600 ₽</span>
            </p>
            <p className="text-sm font-semibold text-primary">
              Доставка по Москве и области
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

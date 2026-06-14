import { ArrowRight, Truck, Clock, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Доставка — Долина Молока",
  description: "Доставка молочных продуктов по Москве и области. Дни доставки: среда и суббота. Минимальный заказ 600 ₽.",
};

const steps = [
  {
    num: "01",
    icon: <ShoppingBag className="size-5" />,
    title: "Выберите продукты",
    desc: "Свежий ассортимент молочных продуктов с фермы — молоко, творог, кефир, масло и йогурты.",
  },
  {
    num: "02",
    icon: <Clock className="size-5" />,
    title: "Оформите заказ",
    desc: "Укажите адрес точки выдачи, имя и телефон. Приём заказов на среду — до понедельника 12:00, на четверг — до четверга 12:00.",
  },
  {
    num: "03",
    icon: <Truck className="size-5" />,
    title: "Получите у двери",
    desc: "Доставляем каждую среду и субботу в точки выдачи. Все продукты едут в автомобиле-рефрижераторе.",
  },
];



export default function DeliveryPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl py-12 sm:py-20">

        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">
            Как это работает
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              От фермы — к вашей двери
            </h1>
            <Link href="/catalog" className="shrink-0">
              <Button className="gap-2 rounded-full h-11 px-6 bg-primary text-primary-foreground">
                Перейти к заказу
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden mb-6">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="bg-background px-5 py-6 sm:px-8 sm:py-10 flex flex-col gap-3">
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

        {/* Info blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {/* Wed */}
          <div className="flex items-center gap-4 bg-foreground text-background rounded-2xl px-5 py-5">
            <div className="size-2.5 rounded-full bg-primary shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">Среда</p>
              <p className="text-xs text-background/60 mt-0.5">Приём заказов до понедельника, 12:00</p>
            </div>
          </div>
          {/* Thu */}
          <div className="flex items-center gap-4 bg-foreground text-background rounded-2xl px-5 py-5">
            <div className="size-2.5 rounded-full bg-primary shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">Четверг</p>
              <p className="text-xs text-background/60 mt-0.5">Приём заказов до четверга, 12:00</p>
            </div>
          </div>
          {/* Hours */}
          <div className="bg-secondary border border-border rounded-2xl px-5 py-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Время работы</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Пн–Пт</span>
                <span className="font-semibold text-foreground">9:00 – 17:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Сб–Вс</span>
                <span className="font-semibold text-foreground">9:00 – 15:00</span>
              </div>
              <div className="h-px bg-border my-1" />
              <p className="text-xs text-muted-foreground">Заказы принимаем круглосуточно через сайт</p>
            </div>
          </div>
          {/* Delivery zone */}
          <div className="flex flex-col gap-3 bg-primary/8 border border-primary/15 rounded-2xl px-5 py-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">Доставка</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-primary shrink-0" />
                По Москве и Московской области
              </div>
              <p className="text-sm text-muted-foreground">Доставка в точки выдачи: среда и четверг</p>
              <div className="h-px bg-primary/15 my-1" />
              <p className="text-sm text-foreground">
                Минимальный заказ — <span className="font-semibold text-primary">600 ₽</span>
              </p>
            </div>
          </div>
        </div>



      </div>
    </main>
  );
}

import { ArrowRight, Truck, Clock, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { PICKUP_POINTS, pickupMapUrl } from "@/lib/pickup-points";

export const metadata: Metadata = {
  title: "Доставка — Долина Молока",
  description:
    "Доставка молочных продуктов по Москве (среда и суббота), Дмитрову и Сергиеву Посаду (вторник и пятница). Минимальный заказ 600 ₽.",
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
    desc: "Укажите адрес точки выдачи, имя и телефон. Сроки приёма заявок — по графику доставки ниже.",
  },
  {
    num: "03",
    icon: <Truck className="size-5" />,
    title: "Получите у курьера",
    desc: "Дмитров и Сергиев Посад — по вторникам и пятницам, Москва — по средам и субботам.",
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
              От фермы — к вашей точке выдачи
            </h1>
            <Button
              render={<Link href="/catalog" />}
              className="shrink-0 gap-2 rounded-full h-11 px-6 bg-primary text-primary-foreground"
            >
              Перейти к заказу
              <ArrowRight className="size-4" />
            </Button>
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

        {/* График доставки */}
        <section aria-labelledby="schedule-heading" className="mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">
            Когда приедем
          </span>
          <h2
            id="schedule-heading"
            className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight text-balance mb-6"
          >
            График доставки
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* Партия №1 */}
            <div className="flex flex-col gap-4 bg-foreground text-background rounded-2xl px-5 py-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Партия №1</span>
                <span className="text-sm font-semibold text-background">Планируется с 16 сентября</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-background/70">Дмитров, Сергиев Посад</span>
                  <span className="font-semibold text-background">Вторник</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-background/70">Москва</span>
                  <span className="font-semibold text-background">Среда</span>
                </div>
              </div>
              <div className="h-px bg-background/15" />
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-background/80">
                  Приём заявок — до четверга, <span className="font-semibold text-background">21:00</span>
                </p>
                <p className="text-xs text-background/60">
                  Молоко для домашнего производства (5 л) — до понедельника, 17:00
                </p>
              </div>
            </div>

            {/* Партия №2 */}
            <div className="flex flex-col gap-4 bg-foreground text-background rounded-2xl px-5 py-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Партия №2</span>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-background/70">Дмитров, Сергиев Посад</span>
                  <span className="font-semibold text-background">Пятница</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-background/70">Москва</span>
                  <span className="font-semibold text-background">Суббота</span>
                </div>
              </div>
              <div className="h-px bg-background/15" />
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-background/80">
                  Приём заявок — до понедельника, <span className="font-semibold text-background">21:00</span>
                </p>
                <p className="text-xs text-background/60">
                  Молоко для домашнего производства (5 л) — до четверга, 17:00
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Расписание связано с графиком планирования на заводе.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Самовывоз */}
            <div className="flex flex-col gap-3 bg-secondary border border-border rounded-2xl px-5 py-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">Самовывоз</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="size-4 text-primary shrink-0" />
                  д. Саввино (Дмитровский район)
                </div>
                <p className="text-base font-semibold text-foreground">Пятница</p>
              </div>
              <div className="h-px bg-border" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground self-start">
                <Clock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                15:00&nbsp;—&nbsp;18:00
              </span>
            </div>
            {/* Delivery zone */}
            <div className="flex flex-col gap-3 bg-primary/8 border border-primary/15 rounded-2xl px-5 py-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">Доставка</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="size-4 text-primary shrink-0" />
                  Москва, Дмитров, Сергиев Посад
                </div>
                <p className="text-sm text-foreground">
                  Москва — <span className="text-base font-semibold">Суббота</span>
                </p>
                <p className="text-sm text-foreground">
                  Дмитров, Сергиев Посад — <span className="text-base font-semibold">Пятница</span>
                </p>
                <div className="h-px bg-primary/15 my-1" />
                <p className="text-sm text-foreground">
                  Минимальный заказ — <span className="font-semibold text-primary">600 ₽</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Точки выдачи */}
        <section aria-labelledby="pickup-heading" className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-3 block">
                Где забрать заказ
              </span>
              <h2
                id="pickup-heading"
                className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight text-balance"
              >
                Точки выдачи в Москве
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm text-pretty">
              Курьер приезжает по расписанию — пожалуйста, подойдите в указанный интервал.
              Точку можно выбрать при оформлении заказа.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PICKUP_POINTS.map((point, index) => (
              <li
                key={point.id}
                className="flex flex-col gap-3 bg-secondary border border-border rounded-2xl px-5 py-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="size-8 shrink-0 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm flex items-center justify-center tabular-nums"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-sm sm:text-base font-semibold text-foreground leading-snug text-pretty">
                      {point.address}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      {point.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                    <Clock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    {point.timeFrom}&nbsp;—&nbsp;{point.timeTo}
                  </span>
                  <a
                    href={pickupMapUrl(point)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    Показать на карте
                    <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="sr-only"> — {point.address}, откроется в новой вкладке</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </main>
  );
}

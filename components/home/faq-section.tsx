"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const faqs = [
  {
    q: "Как оформить заказ?",
    a: "Выберите нужные продукты в каталоге, добавьте в корзину и оформите заказ. Мы свяжемся с вами для подтверждения и уточнения деталей доставки.",
  },
  {
    q: "Когда принимаются заказы?",
    a: "На четверговую доставку — до вторника 20:00. На воскресную доставку — до пятницы 20:00. Заказы, поступившие позже, автоматически переносятся на следующую доставку.",
  },
  {
    q: "Куда осуществляется доставка?",
    a: "Доставляем по Москве и ближайшему Подмосковью в радиусе 30 км от МКАД. Точную стоимость доставки уточняйте при оформлении заказа.",
  },
  {
    q: "Есть ли минимальная сумма заказа?",
    a: "Минимальная сумма заказа — 500 рублей. Бесплатная доставка при заказе от 2 000 рублей.",
  },
  {
    q: "Как хранить продукты после получения?",
    a: "Все продукты хранятся в холодильнике при температуре +2°C…+6°C: молоко — 5 суток, творог и сметана — 7 суток, кефир и йогурт — до 10 суток, масло — до 30 суток.",
  },
  {
    q: "Подходят ли продукты для детей?",
    a: "Да, все продукты подходят для детей старше 12 месяцев. Никаких консервантов, усилителей вкуса или синтетических добавок — только натуральный состав.",
  },
  {
    q: "Что делать, если я получил некачественный продукт?",
    a: "Свяжитесь с нами в день получения — заменим продукт или вернём деньги. Контакты есть на странице «Контакты».",
  },
  {
    q: "Можно ли изменить или отменить заказ?",
    a: "Заказ можно изменить или отменить до наступления дедлайна приёма. После — состав уже собирается и изменения невозможны.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className={cn(
          "text-sm font-semibold leading-relaxed transition-colors",
          open ? "text-primary" : "text-foreground group-hover:text-primary"
        )}>
          {q}
        </span>
        <div className={cn(
          "size-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
          open
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
        )}>
          {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="text-sm text-muted-foreground leading-relaxed pb-5 pr-10">
          {a}
        </p>
      </motion.div>
      <div className="h-px bg-border" />
    </motion.div>
  );
}

export function FaqSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: heading sticky */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 text-balance leading-tight">
              Часто задаваемые вопросы
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Не нашли ответ? Напишите нам — ответим быстро.
            </p>
            <Link
              href="/contacts"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Связаться с нами →
            </Link>
          </motion.div>

          {/* Right: questions */}
          <div className="lg:col-span-2">
            <div className="h-px bg-border mb-0" />
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

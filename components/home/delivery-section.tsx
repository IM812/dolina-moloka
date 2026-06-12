"use client";

import { motion } from "framer-motion";
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
    desc: "Доставляем каждый четверг и воскресенье. Все продукты едут в холодильных контейнерах.",
  },
];

const scheduleRows = [
  { day: "Четверг", label: "Приём заказов", deadline: "до вторника, 20:00" },
  { day: "Воскресенье", label: "Приём заказов", deadline: "до пятницы, 20:00" },
];

export function DeliverySection() {
  return (
    <section id="delivery" className="py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-widest mb-3 block">
              Как это работает
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
              От фермы —<br className="hidden sm:block" /> к вашей двери
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0"
          >
            <Link href="/catalog">
              <Button variant="outline" className="gap-2 rounded-full h-11 px-6 border-foreground/20">
                Перейти к заказу
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden mb-6">
          {steps.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background px-8 py-10 flex flex-col gap-5 group"
            >
              <span className="font-heading text-5xl font-bold text-primary/20 leading-none select-none group-hover:text-primary/40 transition-colors duration-300">
                {num}
              </span>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Schedule + free delivery strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {scheduleRows.map(({ day, label, deadline }, i) => (
            <div
              key={day}
              className="flex items-center justify-between bg-foreground text-background rounded-2xl px-7 py-5"
            >
              <div className="flex items-center gap-4">
                <div className="size-2.5 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="font-bold text-base leading-tight">{day}</p>
                  <p className="text-xs text-background/60 mt-0.5">{label}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-background/80 text-right">{deadline}</span>
            </div>
          ))}

          <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-primary/8 border border-primary/15 rounded-2xl px-7 py-5">
            <p className="text-sm text-foreground leading-relaxed">
              Стоимость доставки — <span className="font-semibold">от 500 ₽</span>
            </p>
            <p className="text-sm font-semibold text-primary whitespace-nowrap">
              Бесплатно от 2 000 ₽
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

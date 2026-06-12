"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ClipboardList, CreditCard, Package } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Выберите продукты",
    description: "Просмотрите каталог и добавьте нужные товары в корзину.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Оформите заказ",
    description: "Заполните форму с контактными данными и выберите точку самовывоза.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Оплатите онлайн",
    description: "Оплата картой или через систему быстрых платежей.",
  },
  {
    number: "04",
    icon: Package,
    title: "Получите заказ",
    description: "Заберите свежие продукты в удобной точке выдачи.",
  },
];

export function HowToOrderSection() {
  return (
    <section id="how-to-order" className="py-14 sm:py-20 bg-secondary">
      <div className="container mx-auto px-5 sm:px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Как оформить заказ
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Четыре простых шага до свежей молочки
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-border z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative z-10 flex flex-col items-center text-center gap-4"
            >
              <div className="size-20 bg-card border-2 border-border rounded-2xl flex flex-col items-center justify-center shadow-sm">
                <step.icon className="size-7 text-primary mb-0.5" />
                <span className="text-[10px] font-bold text-muted-foreground">{step.number}</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

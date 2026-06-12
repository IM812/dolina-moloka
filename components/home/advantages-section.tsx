"use client";

import { motion } from "framer-motion";

const advantages = [
  {
    number: "01",
    title: "Свежие поставки",
    description: "Продукты доставляются дважды в неделю. Вы всегда получаете максимально свежий товар прямо с производства.",
    color: "from-blue-50 to-white",
    accent: "text-blue-400",
  },
  {
    number: "02",
    title: "Натуральный состав",
    description: "Только молоко и живые закваски. Никаких консервантов, стабилизаторов, красителей или ароматизаторов.",
    color: "from-green-50 to-white",
    accent: "text-[var(--brand-green)]",
  },
  {
    number: "03",
    title: "Проверенные производители",
    description: "Работаем только с фермерами, чью продукцию регулярно проверяем. Все поставщики имеют сертификаты.",
    color: "from-amber-50 to-white",
    accent: "text-amber-500",
  },
  {
    number: "04",
    title: "Доставка по адресу",
    description: "Привозим прямо к вашей двери дважды в неделю. Укажите адрес при оформлении — остальное сделаем мы.",
    color: "from-purple-50 to-white",
    accent: "text-purple-400",
  },
  {
    number: "05",
    title: "Контроль качества",
    description: "Каждая партия проходит лабораторный контроль. Сертификаты качества доступны по запросу.",
    color: "from-rose-50 to-white",
    accent: "text-rose-400",
  },
];


export function AdvantagesSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-background">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-10 sm:mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-4">
            Наши преимущества
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Почему нас выбирают снова и снова
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.10)" }}
              className={`group relative bg-gradient-to-br ${adv.color} border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 cursor-default overflow-hidden`}
            >
              <span className={`font-heading text-7xl font-bold ${adv.accent} opacity-15 absolute -top-3 -right-2 select-none`}>
                {adv.number}
              </span>
              <div className="relative">
                <span className={`font-mono text-xs font-semibold tracking-widest ${adv.accent} block mb-4`}>
                  {adv.number}
                </span>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {adv.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

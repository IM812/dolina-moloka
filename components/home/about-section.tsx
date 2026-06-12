"use client";

import { motion } from "framer-motion";
import { Leaf, Thermometer, MapPin, Award, Clock, Heart } from "lucide-react";

const pillars = [
  {
    icon: MapPin,
    title: "Дмитров, Московская область",
    body: "Мы находимся в 65 км от Москвы. Молоко от коров — к вашей двери: без длинных цепочек посредников, без многонедельного хранения на складах.",
  },
  {
    icon: Thermometer,
    title: "Холодовая цепочка не прерывается",
    body: "С момента надоя до момента вручения заказа продукты едут исключительно в холодильных контейнерах. Температура +2...+6°С — всегда.",
  },
  {
    icon: Leaf,
    title: "Без химии. Совсем",
    body: "Никаких стабилизаторов, загустителей и консервантов. Только молоко, живые закваски и традиционные рецепты — то, что мы сами едим каждый день.",
  },
  {
    icon: Clock,
    title: "Свежесть — не маркетинг",
    body: "Срок реализации большинства наших продуктов 5–10 суток. Это настоящая молочка, а не «ультрапастеризат» с месячным сроком годности.",
  },
  {
    icon: Award,
    title: "Проверенные поставщики",
    body: "Мы лично объездили десятки ферм, прежде чем выбрали партнёров. Ветеринарные сертификаты, условия содержания животных, качество кормов — всё проверено.",
  },
  {
    icon: Heart,
    title: "Для своих",
    body: "Первыми нашими покупателями были наши семьи и друзья. Мы не можем продавать то, чему не доверяем сами. Это и есть наш главный стандарт.",
  },
];

export function AboutSection() {
  return (
    <section className="bg-secondary overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl py-16 sm:py-24 md:py-32">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium mb-4 sm:mb-6 block">
              О компании
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] text-balance">
              Почему покупают у нас
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-end"
          >
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Долина молока — небольшая команда из Дмитрова, которая решила
              сделать натуральную молочку доступной для городских семей.
              Без супермаркетов, без лишней наценки, без компромиссов по качеству.
            </p>
          </motion.div>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background p-6 sm:p-8 flex flex-col gap-4 cursor-default hover:bg-secondary transition-colors duration-300"
            >
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <p.icon className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base sm:text-lg leading-snug mb-2">
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

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
    <section className="bg-foreground overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl py-16 sm:py-24 md:py-32">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-white/40 font-medium mb-4 sm:mb-6 block">
              О компании
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] text-balance">
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
            <p className="text-white/60 text-base sm:text-lg leading-relaxed">
              Долина молока — небольшая команда из Дмитрова, которая решила
              сделать натуральную молочку доступной для городских семей.
              Без супермаркетов, без лишней наценки, без компромиссов по качеству.
            </p>
          </motion.div>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              className="bg-foreground p-6 sm:p-8 flex flex-col gap-4 cursor-default transition-colors duration-300"
            >
              <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <p.icon className="size-5 text-white/70" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base sm:text-lg leading-snug mb-2">
                  {p.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {p.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Founder quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-12 sm:mt-16 border-l-2 border-white/20 pl-6 sm:pl-8 max-w-2xl"
        >
          <p className="text-white/70 text-lg sm:text-xl leading-relaxed font-light italic">
            &ldquo;Мы начали с одного вопроса: где купить хорошее молоко в Дмитрове?
            Когда не нашли ответа — решили сделать это сами.&rdquo;
          </p>
          <footer className="mt-4 text-white/35 text-sm tracking-wide uppercase">
            Основатель, Долина молока
          </footer>
        </motion.blockquote>

      </div>
    </section>
  );
}

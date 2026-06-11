"use client";

import { motion } from "framer-motion";

const reviews = [
  { name: "Анна К.", text: "Лучший творог, который я пробовала. Дочь ест с удовольствием каждое утро.", rating: 5 },
  { name: "Михаил П.", text: "Заказываем уже полгода. Качество стабильное, молоко как из детства.", rating: 5 },
  { name: "Светлана Р.", text: "Сметана невероятная. Никогда не думала, что разница может быть такой огромной.", rating: 5 },
  { name: "Дмитрий В.", text: "Очень удобный заказ, всё свежее. Масло топлёное — просто шедевр.", rating: 5 },
  { name: "Ольга М.", text: "Кефир живой, настоящий. Желудок скажет спасибо. Рекомендую всем!", rating: 5 },
  { name: "Иван С.", text: "Брал на пробу — теперь постоянный клиент. Ряженка как у бабушки.", rating: 5 },
  { name: "Татьяна Л.", text: "Йогурт без добавок, натуральный вкус. Дети в восторге, я тоже.", rating: 5 },
  { name: "Андрей Б.", text: "Наконец-то нашёл молоко без привкуса порошка. Настоящее, живое.", rating: 5 },
];

function ReviewCard({ name, text, rating }: (typeof reviews)[0]) {
  return (
    <div className="flex-shrink-0 w-72 bg-card border border-border rounded-3xl px-6 py-5 mx-3 flex flex-col gap-3">
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <svg key={i} viewBox="0 0 16 16" className="size-4 fill-amber-400 flex-shrink-0">
            <path d="M8 12.174 3.309 14.8l.882-5.146L.382 5.95l5.163-.75L8 .6l2.455 4.6 5.163.75-3.809 3.704.882 5.146z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{text}&rdquo;</p>
      <p className="text-xs font-semibold text-foreground mt-auto">{name}</p>
    </div>
  );
}

const doubled = [...reviews, ...reviews];

export function MarqueeReviews() {
  return (
    <section className="py-24 bg-secondary overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-4">
            Отзывы
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
            Нам доверяют тысячи семей
          </h2>
        </motion.div>
      </div>

      {/* Marquee row 1 — left */}
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          {doubled.map((r, i) => <ReviewCard key={i} {...r} />)}
        </motion.div>
      </div>

      {/* Marquee row 2 — right (opposite direction) */}
      <div className="relative flex overflow-hidden mt-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          {doubled.map((r, i) => <ReviewCard key={i} {...r} />)}
        </motion.div>
      </div>
    </section>
  );
}

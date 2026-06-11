"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Анна Петрова",
    rating: 5,
    text: "Наконец-то нашла настоящее деревенское молоко в городе! Творог просто потрясающий — нежный, без крупинок. Дети едят с удовольствием.",
    date: "2 недели назад",
  },
  {
    name: "Михаил Соколов",
    rating: 5,
    text: "Заказываю каждую неделю уже полгода. Качество стабильное, никогда не было проблем. Сметана густая и вкусная, как у бабушки.",
    date: "1 месяц назад",
  },
  {
    name: "Елена Кузнецова",
    rating: 5,
    text: "Очень удобная система заказа. Сайт простой и понятный. Масло сливочное — отличное, без всяких добавок. Буду рекомендовать друзьям.",
    date: "3 недели назад",
  },
  {
    name: "Дмитрий Волков",
    rating: 5,
    text: "Кефир на живых грибках — это что-то особенное. После перехода на продукты Долины молока заметно улучшилось пищеварение.",
    date: "5 дней назад",
  },
  {
    name: "Наталья Смирнова",
    rating: 5,
    text: "Восхитительный йогурт без сахара! Наконец-то честный состав. Готовлю на нём смузи каждое утро. Точка выдачи рядом с домом — удобно.",
    date: "2 месяца назад",
  },
  {
    name: "Алексей Иванов",
    rating: 4,
    text: "Отличный домашний сыр — мягкий, вкусный. Немного дороговато, но за качество готов платить. Жду, когда появится больше сортов.",
    date: "1 неделя назад",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Отзывы покупателей
          </h2>
          <p className="text-muted-foreground text-lg">
            Более 500 довольных клиентов по всей Москве
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {review.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <Stars count={review.rating} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

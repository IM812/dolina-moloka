"use client";

import { motion } from "framer-motion";
import { Leaf, Truck, FlaskConical, Award, Clock, Heart } from "lucide-react";

const advantages = [
  {
    icon: Leaf,
    title: "100% натуральный состав",
    description: "Только молоко и живые закваски. Никаких консервантов, стабилизаторов или красителей.",
  },
  {
    icon: Award,
    title: "Контроль качества",
    description: "Каждая партия проходит лабораторный контроль. Сертификаты на все виды продукции.",
  },
  {
    icon: FlaskConical,
    title: "Живые культуры",
    description: "Кефир, йогурт и ряженка содержат живые молочнокислые бактерии — полезные для кишечника.",
  },
  {
    icon: Clock,
    title: "Свежесть гарантирована",
    description: "Продукты доставляются дважды в неделю. Максимальная свежесть при получении.",
  },
  {
    icon: Truck,
    title: "Удобный самовывоз",
    description: "5 точек выдачи в Москве и Подмосковье. Заказ готов к выдаче в удобное время.",
  },
  {
    icon: Heart,
    title: "Для всей семьи",
    description: "Продукты подходят детям с 1 года, спортсменам и всем, кто следит за питанием.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AdvantagesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Почему выбирают нас
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Мы не идём на компромисс с качеством
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {advantages.map((adv) => (
            <motion.div
              key={adv.title}
              variants={item}
              className="bg-secondary border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="size-12 bg-accent rounded-xl flex items-center justify-center">
                <adv.icon className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">{adv.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

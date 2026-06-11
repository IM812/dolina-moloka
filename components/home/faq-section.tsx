"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Как часто обновляется ассортимент?",
    a: "Продукты производятся дважды в неделю — перед каждой доставкой. Весь ассортимент всегда свежий, максимальный срок с момента производства до выдачи не превышает 48 часов.",
  },
  {
    q: "Можно ли заказать за 1 день до доставки?",
    a: "Заказы на четверговую доставку принимаются до вторника 20:00. На воскресную доставку — до пятницы 20:00. Более поздние заказы переносятся на следующую доставку.",
  },
  {
    q: "Есть ли минимальная сумма заказа?",
    a: "Минимальная сумма заказа — 500 рублей. Самовывоз бесплатный из всех пяти точек выдачи.",
  },
  {
    q: "Как долго хранятся продукты после получения?",
    a: "При соблюдении условий хранения (+2°C … +6°C): молоко — 5 суток, творог и сметана — 7 суток, кефир и йогурт — до 10 суток, масло — до 30 суток.",
  },
  {
    q: "Подходят ли продукты для детей?",
    a: "Да, все продукты подходят для детей старше 12 месяцев. Мы не используем консерванты, усилители вкуса или синтетические добавки. Состав полностью натуральный.",
  },
  {
    q: "Возможен ли возврат или обмен?",
    a: "Если вы получили продукт ненадлежащего качества — свяжитесь с нами в день получения. Мы заменим продукт или вернём деньги. Контакты указаны на странице «Контакты».",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Часто задаваемые вопросы
          </h2>
          <p className="text-muted-foreground text-lg">
            Всё, что важно знать перед заказом
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-secondary border border-border rounded-xl px-4 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

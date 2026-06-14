"use client";

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
    body: "С момента надоя до момента вручения заказа продукты едут в автомобиле-рефрижераторе. Температура +2...+6°С — всегда.",
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
    title: "Наша ферма",
    body: "Ветеринарные справки и свидетельства, условия содержания животных, качество кормов — всё проверено на нашей ферме.",
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
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl py-12 sm:py-20 md:py-28">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-10 sm:mb-16">
          <div>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-muted-foreground font-medium mb-3 sm:mb-5 block">
              О компании
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] text-balance">
              Почему покупают у нас
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed">
              Долина молока — небольшая команда из Дмитрова, которая решила
              доставлять натуральную молочную продукцию братьев Чебурашкиных
              городским семьям. Без супермаркетов, без лишней наценки, без компромиссов по качеству.
            </p>
          </div>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-background p-5 sm:p-8 flex flex-col gap-3 sm:gap-4 hover:bg-secondary transition-colors duration-300"
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
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

"use client";

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
    <section className="py-12 sm:py-20 md:py-28 bg-background">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
        <div className="max-w-xl mb-10 sm:mb-16">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-4">
            Наши преимущества
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Почему нас выбирают снова и снова
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {advantages.map((adv) => (
            <div
              key={adv.number}
              className={`group relative bg-gradient-to-br ${adv.color} border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden`}
            >
              <span className={`font-heading text-7xl font-bold ${adv.accent} opacity-15 absolute -top-3 -right-2 select-none pointer-events-none`}>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

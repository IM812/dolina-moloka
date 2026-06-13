"use client";

const stats = [
  { value: "10 000+", label: "выполненных заказов" },
  { value: "98%", label: "клиентов возвращаются снова" },
  { value: "15 лет", label: "опыта производства" },
  { value: "100%", label: "контроль качества" },
];

export function TrustStats() {
  return (
    <section className="bg-foreground py-10 sm:py-14 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-foreground flex flex-col items-center justify-center text-center py-7 sm:py-10 px-3 sm:px-6 gap-1.5 sm:gap-2"
            >
              <span className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-white/50 text-xs sm:text-sm md:text-base leading-snug max-w-[140px]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-foreground">
      <div className="relative z-10 container mx-auto px-5 sm:px-6 max-w-5xl text-center flex flex-col items-center gap-6 sm:gap-8">
        <span className="text-white/40 text-xs tracking-[0.25em] uppercase">Начните сегодня</span>

        <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] text-balance">
          Попробуйте вкус
          <br />
          <span className="text-white/60">настоящих</span> молочных продуктов
        </h2>

        <p className="text-white/50 text-base sm:text-lg md:text-xl max-w-lg leading-relaxed">
          Оформите заказ за несколько минут. Доставим свежее прямо к вашей двери.
        </p>

        <Link
          href="/catalog"
          className="inline-flex items-center gap-3 bg-white text-foreground font-semibold px-8 py-4 rounded-full text-base hover:bg-white/90 active:scale-95 transition-all shadow-xl"
        >
          Перейти в каталог
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}

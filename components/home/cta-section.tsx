"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-20 sm:py-32 md:py-44 overflow-hidden bg-foreground">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--brand-green)]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <span className="text-white/40 text-xs tracking-[0.25em] uppercase">Начните сегодня</span>

          <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] text-balance">
            Попробуйте вкус
            <br />
            <span className="text-white/60">настоящих</span> молочных продуктов
          </h2>

          <p className="text-white/50 text-lg md:text-xl max-w-lg leading-relaxed">
            Оформите заказ за несколько минут. Доставим свежее прямо к вашей двери.
          </p>

          <Link href="/catalog">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-white text-foreground font-semibold px-10 py-5 rounded-full text-base hover:bg-white/90 transition-colors shadow-2xl"
            >
              Перейти в каталог
              <ArrowRight className="size-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

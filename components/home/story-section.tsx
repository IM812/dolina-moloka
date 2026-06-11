"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function StorySection() {
  return (
    <section className="bg-secondary overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center px-8 md:px-16 py-20 lg:py-28"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-6">
            Наша история
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-8 text-balance">
            Мы не продаём молоко.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-6 text-balance">
            Мы доставляем продукты,
            которые сами ставим на стол своим детям.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            Каждый продукт проходит через наши руки с одним вопросом — 
            съел бы я это сам? Только натуральное молоко, живые закваски 
            и традиционные рецепты. Без компромиссов.
          </p>

          <div className="flex items-center gap-4 mt-10 pt-10 border-t border-border">
            <div className="size-12 rounded-full bg-[var(--brand-green)]/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="size-6 text-[var(--brand-green)]">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground italic">
              &ldquo;Качество — это не опция, это единственный вариант.&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-[400px] lg:min-h-0"
        >
          <Image
            src="/story-bg.png"
            alt="Наша ферма"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent lg:bg-gradient-to-l" />
        </motion.div>
      </div>
    </section>
  );
}

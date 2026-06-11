"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[640px] flex items-end overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero-bg.png"
        alt="Натуральные молочные продукты"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Gradient overlay — bottom-heavy for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-6 max-w-7xl pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 tracking-wide"
          >
            Натуральная молочная продукция
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight text-balance mb-6"
          >
            Настоящие молочные продукты
            <br className="hidden md:block" />
            <span className="text-white/80"> для вашей семьи</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl mb-10"
          >
            Свежая продукция от проверенных производителей.
            Удобный заказ и доставка в вашем городе.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-white/90 font-semibold gap-2 px-8 h-14 text-base rounded-full transition-all duration-300 hover:scale-105 active:scale-100"
              >
                Смотреть продукцию
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/checkout">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/15 hover:border-white/60 font-medium px-8 h-14 text-base rounded-full backdrop-blur-sm transition-all duration-300"
              >
                Оформить заказ
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-white/50 text-xs tracking-widest rotate-90 origin-center">SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-10 bg-white/30 rounded-full"
        />
      </motion.div>
    </section>
  );
}

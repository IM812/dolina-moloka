"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Hero entrance animations are fine on mobile (page-load, not scroll-triggered)
// but we keep them simple and fast.
export function HeroSection() {
  return (
    <section className="relative w-full h-[calc(100svh-5rem)] min-h-[580px] flex items-start overflow-hidden will-change-transform">
      {/* Background image */}
      <Image
        src="/story-bg.png"
        alt="Натуральные молочные продукты"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/40" />

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-5 sm:px-6 max-w-7xl pt-14 sm:pt-20 pb-8">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-white/30 bg-black/40 text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 tracking-widest uppercase">
            Натуральная молочная продукция
          </div>

          {/* Headline */}
          <h1 className="font-heading text-[2.5rem] leading-[1.08] sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight text-balance mb-4 sm:mb-6">
            Настоящие молочные продукты
            <span className="text-white/75"> для вашей семьи</span>
          </h1>

          {/* Subheadline */}
          <p className="text-white/70 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mb-7 sm:mb-10">
            Свежая продукция от проверенных производителей.
            Удобный заказ и доставка в вашем городе.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/catalog" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-white text-foreground hover:bg-white/90 font-semibold gap-2 px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base rounded-full shadow-lg active:scale-95 transition-transform"
              >
                Смотреть продукцию
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/checkout" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-white/15 text-white hover:bg-white/25 border border-white/40 font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base rounded-full active:scale-95 transition-transform"
              >
                Оформить заказ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator — desktop only */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2">
        <span className="text-white/40 text-xs tracking-widest rotate-90 origin-center">SCROLL</span>
        <div className="w-px h-10 bg-white/25 rounded-full animate-pulse" />
      </div>
    </section>
  );
}

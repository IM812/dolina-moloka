"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-anim {
          opacity: 0;
          animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-anim-1 { animation-delay: 0.05s; }
        .hero-anim-2 { animation-delay: 0.22s; }
        .hero-anim-3 { animation-delay: 0.38s; }
      `}</style>

      <section className="relative w-full h-[calc(100svh-5rem)] min-h-[580px] flex items-start overflow-hidden">
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
        <div className="relative z-10 w-full h-full flex flex-col justify-between container mx-auto px-5 sm:px-6 max-w-7xl pt-12 sm:pt-16 pb-10 sm:pb-14">

          {/* Top: badge + headline */}
          <div className="hero-anim hero-anim-1 max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-white/30 bg-black/40 text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 tracking-widest uppercase">
              Натуральная молочная продукция
            </div>
            <h1 className="font-heading text-[2.5rem] leading-[1.08] sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight text-balance">
              Настоящие молочные продукты
              <span className="text-white/75"> для вашей семьи</span>
            </h1>
          </div>

          {/* Middle: subtitle — left-aligned, same edge as headline */}
          <p className="hero-anim hero-anim-2 text-white/70 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl">
            Свежая продукция от проверенных производителей.
            Удобный заказ и доставка в вашем городе.
          </p>

          {/* Bottom: CTAs */}
          <div className="hero-anim hero-anim-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl">
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

        {/* Scroll indicator — desktop only */}
        <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs tracking-widest rotate-90 origin-center">SCROLL</span>
          <div className="w-px h-10 bg-white/25 rounded-full animate-pulse" />
        </div>
      </section>
    </>
  );
}

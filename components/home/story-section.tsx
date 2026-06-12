"use client";

import Image from "next/image";

export function StorySection() {
  return (
    <section className="bg-secondary overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[600px]">
        {/* Text */}
        <div className="flex flex-col justify-center px-5 sm:px-8 md:px-16 py-10 sm:py-14 lg:py-28">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium mb-4 sm:mb-6">
            Наша история
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-5 sm:mb-8 text-balance">
            Мы не продаём молоко.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-4 sm:mb-6 text-balance">
            Мы доставляем продукты,
            которые сами ставим на стол своим детям.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
            Каждый продукт проходит через наши руки с одним вопросом —
            съел бы я это сам? Только натуральное молоко, живые закваски
            и традиционные рецепты. Без компромиссов.
          </p>

          <div className="flex items-center gap-4 mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-border">
            <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="size-5 sm:size-6 text-primary">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground italic">
              &ldquo;Качество — это не опция, это единственный вариант.&rdquo;
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-56 sm:h-80 lg:h-auto">
          <Image
            src="/story-farm.png"
            alt="Наша ферма"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent lg:bg-gradient-to-l" />
        </div>
      </div>
    </section>
  );
}

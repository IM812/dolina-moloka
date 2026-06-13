"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/mock-data";

const categories = [
  { title: "Молоко",  description: "Цельное, пастеризованное",   href: "/catalog?category=Молоко",  num: "01" },
  { title: "Кефир",   description: "Живой, на кефирных грибках",  href: "/catalog?category=Кефир",   num: "02" },
  { title: "Йогурт",  description: "Питьевой и греческий",        href: "/catalog?category=Йогурт",  num: "03" },
  { title: "Творог",  description: "Фермерский, 9%",              href: "/catalog?category=Творог",  num: "04" },
  { title: "Сметана", description: "Термостатная 20%",            href: "/catalog?category=Сметана", num: "05" },
  { title: "Масло",   description: "Сладко-сливочное 82,5%",      href: "/catalog?category=Масло",   num: "06" },
];

export function CategoriesSection() {
  const countByCategory = (cat: string) =>
    products.filter((p) => p.category === cat).length;

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-secondary overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-3">
              Каталог
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Категории продукции
            </h2>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline underline-offset-4 transition-all shrink-0"
          >
            Весь каталог
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Full-width photo banner */}
        <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-3xl overflow-hidden mb-6">
          <Image
            src="/categories-banner.png"
            alt="Ферма Долина Молока — коровы на пастбище"
            fill
            priority
            className="object-cover object-[center_60%]"
            sizes="100vw"
          />
          {/* Dark overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/65 via-foreground/20 to-transparent" />
          <div className="absolute left-6 bottom-6 sm:left-8 sm:bottom-8">
            <p className="text-white/70 text-xs sm:text-sm font-medium mb-1.5 tracking-wide">
              Фермерское хозяйство · Подмосковье
            </p>
            <p className="text-white text-xl sm:text-2xl md:text-3xl font-heading font-bold leading-snug text-balance">
              Натуральные молочные<br />продукты с фермы
            </p>
          </div>
          <Link
            href="/catalog"
            className="absolute right-6 bottom-6 sm:right-8 sm:bottom-8 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-white/25 transition-colors"
          >
            В каталог
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Category row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const count = countByCategory(cat.title);
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative bg-background rounded-2xl border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between gap-3 overflow-hidden min-h-[130px]"
              >
                {/* Big number watermark */}
                <span className="absolute -top-2 -right-1 text-[4.5rem] font-heading font-bold text-border/60 leading-none select-none group-hover:text-primary/10 transition-colors duration-300">
                  {cat.num}
                </span>

                <div className="relative">
                  <p className="font-semibold text-foreground text-sm sm:text-base leading-tight">{cat.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                </div>

                <div className="relative flex items-center justify-between">
                  <span className="text-xs text-muted-foreground tabular-nums">{count} поз.</span>
                  <div className="size-6 sm:size-7 rounded-full bg-secondary border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300">
                    <ArrowRight className="size-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

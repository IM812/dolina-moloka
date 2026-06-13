"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/mock-data";

const categories = [
  { title: "Молоко",  description: "Цельное, пастеризованное",   href: "/catalog?category=Молоко" },
  { title: "Кефир",   description: "Живой, на кефирных грибках",  href: "/catalog?category=Кефир" },
  { title: "Йогурт",  description: "Питьевой и греческий",        href: "/catalog?category=Йогурт" },
  { title: "Творог",  description: "Фермерский, 9%",              href: "/catalog?category=Творог" },
  { title: "Сметана", description: "Термостатная 20%",            href: "/catalog?category=Сметана" },
  { title: "Масло",   description: "Сладко-сливочное 82,5%",      href: "/catalog?category=Масло" },
];

export function CategoriesSection() {
  const countByCategory = (cat: string) =>
    products.filter((p) => p.category === cat).length;

  return (
    <section className="py-12 sm:py-20 md:py-28 bg-secondary">
      <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-14">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-4">
              Каталог
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Категории продукции
            </h2>
          </div>
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4 transition-all"
          >
            Весь каталог
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Layout: hero photo left + category grid right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Hero photo card */}
          <div className="lg:col-span-2 relative bg-background rounded-3xl overflow-hidden border border-border min-h-[380px] lg:min-h-0">
            <Image
              src="/dairy-products.jpg"
              alt="Ассортимент молочных продуктов"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            {/* Overlay badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-primary-foreground/80 text-sm font-medium mb-1">Фермерское хозяйство</p>
              <p className="text-white text-xl font-bold font-heading leading-snug">
                Натуральные молочные<br />продукты из Подмосковья
              </p>
              <Link
                href="/catalog"
                className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                В каталог
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Category grid */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const count = countByCategory(cat.title);
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between gap-4 min-h-[130px]"
                >
                  <div>
                    <p className="font-semibold text-foreground text-base leading-tight">{cat.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground tabular-nums">{count} поз.</span>
                    <div className="size-7 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

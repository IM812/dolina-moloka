"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/mock-data";

const categories = [
  {
    title: "Молоко",
    description: "Цельное, пастеризованное",
    image: "/products/milk-1l.png",
    href: "/catalog?category=Молоко",
    span: "lg:col-span-2 lg:row-span-2",
    imgScale: "scale-90",
  },
  {
    title: "Кефир",
    description: "Живой, на кефирных грибках",
    image: "/products/kefir-pet.png",
    href: "/catalog?category=Кефир",
    span: "",
    imgScale: "scale-75",
  },
  {
    title: "Йогурт",
    description: "Питьевой и греческий",
    image: "/products/yogurt-raspberry.png",
    href: "/catalog?category=Йогурт",
    span: "",
    imgScale: "scale-75",
  },
  {
    title: "Творог",
    description: "Фермерский, 9%",
    image: "/products/tvorog-cup.png",
    href: "/catalog?category=Творог",
    span: "",
    imgScale: "scale-75",
  },
  {
    title: "Сметана",
    description: "Термостатная 20%",
    image: "/products/smetana-cup.png",
    href: "/catalog?category=Сметана",
    span: "",
    imgScale: "scale-75",
  },
  {
    title: "Масло",
    description: "Сладко-сливочное 82,5%",
    image: "/products/butter-200g.png",
    href: "/catalog?category=Масло",
    span: "lg:col-span-2",
    imgScale: "scale-75",
  },
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

        {/* Bento grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const count = countByCategory(cat.title);
            const isLarge = cat.span.includes("row-span-2");
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group relative bg-background rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col ${cat.span} border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300`}
              >
                {/* Image area */}
                <div className={`relative w-full overflow-hidden bg-background ${isLarge ? "h-56 sm:h-72 lg:h-80" : "h-36 sm:h-44"}`}>
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className={`object-contain transition-transform duration-500 group-hover:scale-105 ${cat.imgScale}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-t border-border mt-auto">
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base leading-tight">{cat.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{count} поз.</span>
                    <div className="size-7 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <ArrowRight className="size-3.5" />
                    </div>
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

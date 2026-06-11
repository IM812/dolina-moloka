"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Молоко",
    description: "Цельное, пастеризованное",
    image: "/products/milk.png",
    bg: "bg-blue-50",
    href: "/catalog?category=Молоко",
  },
  {
    title: "Творог и сыры",
    description: "Фермерский, мягкий, зернёный",
    image: "/products/cottage-cheese.png",
    bg: "bg-amber-50",
    href: "/catalog?category=Творог",
  },
  {
    title: "Масло",
    description: "Крестьянское, топлёное",
    image: "/products/butter.png",
    bg: "bg-yellow-50",
    href: "/catalog?category=Масло",
  },
  {
    title: "Кисломолочные",
    description: "Кефир, ряженка, йогурт, сметана",
    image: "/products/kefir.png",
    bg: "bg-green-50",
    href: "/catalog?category=Кефир",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14"
        >
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-4">
              Каталог
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
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
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={cat.href} className="group block">
                <div className={`${cat.bg} rounded-3xl overflow-hidden aspect-square relative flex items-end p-6 hover:shadow-2xl transition-all duration-500`}>
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 w-full group-hover:bg-white transition-colors duration-300">
                    <p className="font-semibold text-foreground text-base">{cat.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

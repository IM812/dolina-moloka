"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Shield, Truck } from "lucide-react";

const badges = [
  { icon: Leaf, label: "Натуральный состав" },
  { icon: Shield, label: "Без консервантов" },
  { icon: Truck, label: "Доставка 2 раза в неделю" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[520px] py-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded-full text-sm font-medium w-fit">
              <Leaf className="size-4" />
              Прямо с фермы на ваш стол
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Молочные продукты
              <span className="text-primary"> без компромиссов</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Цельное молоко, фермерский творог, натуральная сметана — всё без
              консервантов, красителей и добавок. Только чистое молоко от коров
              на экологически чистых пастбищах.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/catalog">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto">
                  Смотреть каталог
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
              </Link>
              <Link href="/#how-to-order">
                <Button size="lg" variant="outline" className="border-border w-full sm:w-auto">
                  Как заказать
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              {badges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground"
                >
                  <Icon className="size-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3 scale-95" />
              <div className="relative bg-card rounded-3xl overflow-hidden shadow-xl border border-border">
                <div className="aspect-square relative">
                  <Image
                    src="/products/milk.png"
                    alt="Свежее молоко Долина молока"
                    fill
                    priority
                    className="object-contain p-8"
                  />
                </div>
              </div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-lg border border-border p-3 flex items-center gap-3"
              >
                <div className="size-10 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
                  <span className="text-[#22C55E] font-bold text-sm">8</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Видов продуктов</p>
                  <p className="text-sm font-semibold text-foreground">Всегда свежие</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-lg border border-border p-3"
              >
                <p className="text-xs text-muted-foreground">Срок хранения</p>
                <p className="text-sm font-semibold text-primary">5–14 суток</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

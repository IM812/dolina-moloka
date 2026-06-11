"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground text-balance">
            Попробуйте натуральную молочку
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl leading-relaxed">
            Оформите первый заказ и убедитесь в разнице. Без искусственных
            добавок, без компромиссов — только вкус настоящих продуктов.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 gap-2 w-full sm:w-auto"
              >
                Смотреть каталог
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/contacts">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                Связаться с нами
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

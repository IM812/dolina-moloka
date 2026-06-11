"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Calendar } from "lucide-react";
import { pickupPoints } from "@/lib/mock-data";

export function DeliverySection() {
  return (
    <section id="delivery" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Доставка и точки выдачи
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Мы доставляем продукты дважды в неделю. Заказы принимаются до
              вторника 20:00 (доставка в четверг) и до пятницы 20:00 (доставка
              в воскресенье).
            </p>

            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Calendar,
                  title: "График доставки",
                  desc: "Четверг и воскресенье, с 10:00 до 19:00",
                },
                {
                  icon: Clock,
                  title: "Срок хранения в точке",
                  desc: "Продукты хранятся в холодильнике до 24 часов",
                },
                {
                  icon: MapPin,
                  title: "Зона доставки",
                  desc: "Москва и ближайшее Подмосковье",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="size-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-0.5">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold text-foreground mb-4 text-lg">Точки самовывоза</h3>
            <div className="flex flex-col gap-3">
              {pickupPoints.map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3 bg-secondary border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="size-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="size-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{point}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

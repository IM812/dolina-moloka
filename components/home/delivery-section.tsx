"use client";

import { motion } from "framer-motion";
import { Truck, Calendar, Clock, MapPin, ShieldCheck } from "lucide-react";

const deliveryItems = [
  {
    icon: Calendar,
    title: "Два раза в неделю",
    desc: "Доставляем по четвергам и воскресеньям с 10:00 до 19:00.",
  },
  {
    icon: Clock,
    title: "Дедлайн приёма заказов",
    desc: "На четверг — до вторника 20:00. На воскресенье — до пятницы 20:00.",
  },
  {
    icon: MapPin,
    title: "Доставка по адресу",
    desc: "Привозим прямо к вашей двери. Укажите адрес при оформлении заказа.",
  },
  {
    icon: ShieldCheck,
    title: "Температурный режим",
    desc: "Все продукты перевозятся в холодильных контейнерах. Цепочка холода не прерывается.",
  },
  {
    icon: Truck,
    title: "Стоимость доставки",
    desc: "Доставка от 500 рублей. При заказе от 2 000 рублей — бесплатно.",
  },
];

export function DeliverySection() {
  return (
    <section id="delivery" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
              Доставка
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-balance leading-tight">
              Свежие продукты — прямо к вашей двери
            </h2>

            <div className="flex flex-col gap-6">
              {deliveryItems.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="size-11 bg-background border border-border rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-0.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: visual delivery card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="bg-background rounded-3xl border border-border p-8 shadow-sm">
              <div className="flex flex-col gap-4">
                {[
                  { day: "Четверг", deadline: "Приём заказов до вторника 20:00" },
                  { day: "Воскресенье", deadline: "Приём заказов до пятницы 20:00" },
                ].map(({ day, deadline }) => (
                  <div
                    key={day}
                    className="flex items-center justify-between rounded-2xl px-5 py-4 bg-secondary border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-2.5 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground">{day}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{deadline}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/15 px-5 py-4 text-sm text-foreground leading-relaxed">
                Бесплатная доставка при заказе от{" "}
                <span className="font-bold text-primary">2 000 ₽</span>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 size-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

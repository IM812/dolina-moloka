"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types";

// Confetti particle
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute top-0 w-2 h-3 rounded-sm"
      style={{ left: `${x}%`, backgroundColor: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: "100vh", opacity: [1, 1, 0], rotate: 360 * 3 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: "easeIn" }}
    />
  );
}

const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  delay: Math.random() * 1.2,
  x: Math.random() * 100,
  color: ["#3B82F6", "#60A5FA", "#BFDBFE", "#FDE68A", "#6EE7B7", "#FCA5A5"][Math.floor(Math.random() * 6)],
}));

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }
    fetch(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then(({ order }) => setOrder(order ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {CONFETTI.map((p) => (
          <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
        ))}
      </div>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 max-w-2xl py-12 flex flex-col items-center gap-10">

        {/* Cow hero */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/happy-cow.png"
              alt="Весёлая корова"
              width={220}
              height={220}
              className="object-contain drop-shadow-xl"
              priority
            />
          </motion.div>
          {/* Sparkles around cow */}
          {[[-30, -10], [30, -20], [-20, 30], [40, 20]].map(([ox, oy], i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `calc(50% + ${ox}px)`, top: `calc(50% + ${oy}px)` }}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
            >
              <Sparkles className="size-5 text-yellow-400" />
            </motion.div>
          ))}
        </motion.div>

        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center flex flex-col gap-3"
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="size-8 text-green-500 shrink-0" />
            <h1 className="text-4xl font-bold text-foreground text-balance">Спасибо за заказ!</h1>
          </div>
          <p className="text-lg text-muted-foreground text-balance">
            Оплата прошла успешно — уже начинаем готовить для вас.
          </p>
          {order && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="inline-flex items-center self-center gap-2 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-full px-5 py-2 text-sm mt-1"
            >
              <CheckCircle2 className="size-4" />
              Заказ {order.orderNumber}
            </motion.div>
          )}
        </motion.div>

        {/* Order summary */}
        {order && order.items?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="w-full bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground uppercase tracking-wide">Состав заказа</p>
            </div>
            <div className="px-6 py-4 flex flex-col gap-3">
              {order.items.map((item, idx) => (
                <div key={item.productId ?? idx} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} шт. × {item.price.toLocaleString("ru-RU")} ₽</p>
                  </div>
                  <span className="text-sm font-bold text-foreground shrink-0">
                    {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Итого</span>
                <span className="text-2xl font-bold text-foreground">
                  {order.totalAmount.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-muted-foreground text-center text-balance"
        >
          Отслеживайте статус заказа в разделе «Мои заказы» по номеру телефона
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full gap-2 h-12 text-base">
              <Package className="size-5" />
              Мои заказы
            </Button>
          </Link>
          <Link href="/catalog" className="flex-1">
            <Button className="w-full gap-2 h-12 text-base">
              Продолжить покупки
              <ArrowRight className="size-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

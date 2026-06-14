"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";

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
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Top banner with cow */}
          <div className="bg-primary/5 border-b border-border flex flex-col items-center gap-2 pt-8 pb-0">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
            >
              <Image
                src="/happy-cow.png"
                alt="Весёлая корова"
                width={160}
                height={160}
                className="object-contain drop-shadow-md"
                priority
              />
            </motion.div>
          </div>

          <div className="p-8 flex flex-col gap-6 text-center">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-2 items-center"
            >
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="size-6 text-[#22C55E]" />
                <h1 className="text-2xl font-bold text-foreground">Спасибо за заказ!</h1>
              </div>
              <p className="text-muted-foreground text-balance">
                Оплата прошла успешно. Уже начинаем готовить.
              </p>
              {order && (
                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 text-sm px-3 py-1 mt-1">
                  {order.orderNumber}
                </Badge>
              )}
            </motion.div>

            {/* Order items */}
            {order && order.items?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 text-left bg-muted/40 rounded-xl p-4"
              >
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Состав заказа</p>
                {order.items.map((item, idx) => (
                  <div key={item.productId ?? idx} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-foreground line-clamp-1 flex-1">
                      {item.productName}
                      <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                    </span>
                    <span className="font-medium text-foreground shrink-0">
                      {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-foreground">Итого</span>
                  <span className="text-foreground text-base">{order.totalAmount.toLocaleString("ru-RU")} ₽</span>
                </div>
              </motion.div>
            )}

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground text-balance"
            >
              Статус заказа можно отследить по номеру телефона в разделе «Мои заказы»
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col gap-3"
            >
              <Link href="/orders">
                <Button variant="outline" className="w-full gap-2 border-border">
                  <Package className="size-4" />
                  Мои заказы
                </Button>
              </Link>
              <Link href="/catalog">
                <Button className="w-full gap-2">
                  Продолжить покупки
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

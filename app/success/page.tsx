"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Mail, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Order } from "@/types";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }

    fetch("/api/orders")
      .then((r) => r.json())
      .then(({ orders }) => {
        const found = orders.find((o: Order) => o.orderNumber === orderNumber);
        setOrder(found ?? null);
      })
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-6 text-center"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="size-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="size-10 text-[#22C55E]" />
            </div>
          </motion.div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-foreground">Спасибо за заказ!</h1>
            {order ? (
              <>
                <p className="text-muted-foreground">
                  Ваш заказ успешно оплачен
                </p>
                <div className="inline-flex items-center justify-center gap-2">
                  <span className="font-mono font-bold text-lg text-foreground">{order.orderNumber}</span>
                  <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">Оплачен</Badge>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Заказ успешно оформлен и оплачен</p>
            )}
          </div>

          {order && (
            <>
              <Separator className="bg-border" />

              {/* Order details */}
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-start gap-3 bg-secondary border border-border rounded-xl p-3">
                  <MapPin className="size-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Точка выдачи</p>
                    <p className="text-sm font-medium text-foreground">{order.customer.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-secondary border border-border rounded-xl p-3">
                  <Mail className="size-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Подтверждение отправлено</p>
                    <p className="text-sm font-medium text-foreground">{order.customer.email}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Items */}
              <div className="flex flex-col gap-2 text-left">
                <h3 className="font-semibold text-foreground text-sm">Состав заказа</h3>
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-bold mt-1 pt-2 border-t border-border">
                  <span className="text-foreground">Итого</span>
                  <span className="text-foreground">{order.totalAmount.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
            </>
          )}

          <Separator className="bg-border" />

          <div className="flex flex-col gap-3">
            <Link href="/orders">
              <Button variant="outline" className="w-full border-border gap-2">
                Мои заказы
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/catalog">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Продолжить покупки
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

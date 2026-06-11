"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CreditCard, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { setPaymentStatus } from "@/lib/cookies";
import { toast } from "sonner";
import { Order } from "@/types";
import Link from "next/link";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderNumber) { setLoadingOrder(false); return; }

    fetch(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then(({ order }) => setOrder(order ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoadingOrder(false));
  }, [orderNumber]);

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.orderNumber }),
      });

      if (!res.ok) throw new Error("Ошибка оплаты");

      setPaymentStatus("paid");
      toast.success("Оплата прошла успешно!");
      router.push(`/success?order=${order.orderNumber}`);
    } catch (err) {
      console.error("[payment] error:", err);
      toast.error("Ошибка при обработке оплаты. Попробуйте ещё раз.");
    } finally {
      setPaying(false);
    }
  };

  if (loadingOrder) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderNumber || !order) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-lg text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground">Заказ не найден</h1>
          <p className="text-muted-foreground">Проверьте номер заказа или вернитесь в каталог</p>
          <Link href="/catalog">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">В каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <CreditCard className="size-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Оплата заказа</h1>
            <p className="text-muted-foreground text-sm">Заказ создан и ожидает оплаты</p>
          </div>

          <Separator className="bg-border" />

          {/* Order info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Номер заказа</span>
              <span className="font-mono font-bold text-foreground">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Покупатель</span>
              <span className="text-sm font-medium text-foreground">{order.customer.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Точка выдачи</span>
              <span className="text-sm text-foreground text-right max-w-[200px]">{order.customer.pickupAddress}</span>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Items */}
          <div className="flex flex-col gap-2.5">
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
          </div>

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-lg">К оплате</span>
            <span className="font-bold text-foreground text-2xl">
              {order.totalAmount.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          {/* Security note */}
          <div className="bg-secondary border border-border rounded-xl p-3 flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#22C55E] flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Платёж защищён. После подключения реальной оплаты здесь будет
              виджет ЮKassa или CloudPayments.
            </p>
          </div>

          {/* Pay button */}
          <Button
            onClick={handlePay}
            disabled={paying}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            {paying ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Lock className="size-4" data-icon="inline-start" />
            )}
            {paying ? "Обработка..." : `Оплатить ${order.totalAmount.toLocaleString("ru-RU")} ₽`}
          </Button>

          <Badge variant="secondary" className="text-center text-xs text-muted-foreground justify-center">
            Это демо-оплата. Реальные деньги не списываются.
          </Badge>
        </motion.div>
      </div>
    </div>
  );
}

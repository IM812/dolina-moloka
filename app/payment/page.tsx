"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import { Loader2, CreditCard, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface PendingOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface PendingOrder {
  customer: {
    fullName: string;
    phone: string;
    email: string;
    pickupAddress: string;
    comment: string;
  };
  items: PendingOrderItem[];
  totalAmount: number;
}

function PaymentContent() {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingOrder");
    if (raw) {
      try {
        setPendingOrder(JSON.parse(raw));
      } catch {
        setPendingOrder(null);
      }
    }
    setLoaded(true);
  }, []);

  const handlePay = async () => {
    if (!pendingOrder) return;
    setPaying(true);

    try {
      // Step 1: process payment
      const payRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: pendingOrder.totalAmount }),
      });

      if (!payRes.ok) throw new Error("Ошибка платёжного сервиса");
      const payData = await payRes.json();
      if (!payData.success) throw new Error(payData.error ?? "Оплата отклонена");

      // Step 2: payment succeeded — save order to DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingOrder),
      });

      const orderBody = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderBody?.error ?? "Ошибка сохранения заказа");

      sessionStorage.removeItem("pendingOrder");
      clearCart();
      toast.success("Оплата прошла успешно!");
      router.push(`/success?order=${orderBody.order.orderNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка при обработке оплаты. Попробуйте ещё раз.");
    } finally {
      setPaying(false);
    }
  };

  if (!loaded) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pendingOrder) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-lg text-center flex flex-col items-center gap-4">
          <div className="size-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Заказ не найден</h1>
          <p className="text-muted-foreground">Вернитесь в корзину и оформите заказ заново</p>
          <Link href="/cart">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Вернуться в корзину</Button>
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
            <p className="text-muted-foreground text-sm">Заказ будет сохранён после успешной оплаты</p>
          </div>

          <Separator className="bg-border" />

          {/* Customer info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Покупатель</span>
              <span className="text-sm font-medium text-foreground">{pendingOrder.customer.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Телефон</span>
              <span className="text-sm text-foreground">{pendingOrder.customer.phone}</span>
            </div>
            {pendingOrder.customer.pickupAddress && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-muted-foreground shrink-0">Адрес</span>
                <span className="text-sm text-foreground text-right">{pendingOrder.customer.pickupAddress}</span>
              </div>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Items */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-semibold text-foreground text-sm">Состав заказа</h3>
            {pendingOrder.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
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
              {pendingOrder.totalAmount.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          {/* Security note */}
          <div className="bg-secondary border border-border rounded-xl p-3 flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#22C55E] flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Нажимая кнопку, вы подтверждаете оплату. Заказ будет передан в обработку сразу после списания средств.
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
            {paying ? "Обработка..." : `Оплатить ${pendingOrder.totalAmount.toLocaleString("ru-RU")} ₽`}
          </Button>

          <Badge variant="secondary" className="text-center text-xs text-muted-foreground justify-center">
            Это демо-оплата. Реальные деньги не списываются.
          </Badge>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}

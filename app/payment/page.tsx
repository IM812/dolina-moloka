"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import { Loader2, CreditCard, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

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
  const [createdOrderData, setCreatedOrderData] = useState<{ orderId: string; orderNumber: string; invoiceUrl: string } | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Загружаем pendingOrder из sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingOrder");
    if (raw) {
      try { setPendingOrder(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  // Создаём заказ ОДИН РАЗ при загрузке страницы
  useEffect(() => {
    if (!pendingOrder || createdOrderData || orderLoading) return;

    setOrderLoading(true);
    fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingOrder),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error ?? "Ошибка создания заказа");
        setCreatedOrderData(data);
      })
      .catch((err) => {
        setOrderError(err instanceof Error ? err.message : "Ошибка создания заказа");
      })
      .finally(() => setOrderLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOrder]);

  const handlePay = () => {
    if (!createdOrderData) return;
    setPaying(true);
    clearCart();
    sessionStorage.removeItem("pendingOrder");
    // Редиректим на страницу оплаты PayKeeper
    window.location.href = createdOrderData.invoiceUrl;
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
            <Button>Вернуться в корзину</Button>
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
            <p className="text-muted-foreground text-sm">
              После нажатия кнопки вы будете перенаправлены на защищённую страницу банка
            </p>
          </div>

          <Separator />

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

          <Separator />

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

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-lg">К оплате</span>
            <span className="font-bold text-foreground text-2xl">
              {pendingOrder.totalAmount.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          {/* Payment logos */}
          <div className="flex items-center justify-center gap-3">
            <Image src="/payment/logos.png" alt="Visa, Mastercard, Мир" width={180} height={32} className="h-7 w-auto object-contain" />
            <Image src="/payment/sbp.svg" alt="СБП" width={40} height={32} className="h-7 w-auto object-contain" />
          </div>

          {/* Security note */}
          <div className="bg-secondary border border-border rounded-xl p-3 flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#22C55E] flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Оплата производится через защищённую страницу ПАО «Промсвязьбанк». Данные карты не передаются продавцу.
              Транзакция защищена по технологии 3-D Secure.
            </p>
          </div>

          {/* Ошибка создания заказа */}
          {orderError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="size-5 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive">{orderError}</p>
            </div>
          )}

          {/* Pay button */}
          <Button
            onClick={handlePay}
            disabled={paying || orderLoading || !createdOrderData || !!orderError}
            size="lg"
            className="w-full gap-2"
          >
            {(paying || orderLoading) ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}
            {orderLoading
              ? "Подготовка заказа..."
              : paying
              ? "Переход к оплате..."
              : `Оплатить ${pendingOrder.totalAmount.toLocaleString("ru-RU")} ₽`}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import { Loader2, CreditCard, ShieldCheck, Lock, AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";

const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 минут

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

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PaymentContent() {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<{
    orderId: string;
    invoiceUrl: string;
    expiresAt: string;
  } | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Таймер
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

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
        // Инициализируем таймер из expiresAt полученного с сервера
        const msLeft = new Date(data.expiresAt).getTime() - Date.now();
        setTimeLeft(Math.max(0, msLeft));
      })
      .catch((err) => {
        setOrderError(err instanceof Error ? err.message : "Ошибка создания заказа");
      })
      .finally(() => setOrderLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOrder]);

  // Тик таймера
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => Math.max(0, (t ?? 0) - 1000)), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Автоотмена при истечении таймера
  useEffect(() => {
    if (!expired || !createdOrderData) return;
    fetch("/api/payment/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: createdOrderData.orderId }),
    }).catch(() => { /* best-effort */ });
    sessionStorage.removeItem("pendingOrder");
  }, [expired, createdOrderData]);

  const handleCancel = useCallback(() => {
    if (createdOrderData) {
      fetch("/api/payment/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: createdOrderData.orderId }),
      }).catch(() => { /* best-effort */ });
    }
    sessionStorage.removeItem("pendingOrder");
    router.push("/checkout");
  }, [createdOrderData, router]);

  const handlePay = () => {
    if (!createdOrderData) return;
    setPaying(true);
    clearCart();
    sessionStorage.removeItem("pendingOrder");
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
          <Link href="/cart"><Button>Вернуться в корзину</Button></Link>
        </div>
      </div>
    );
  }

  // Экран: время истекло
  if (expired) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-lg text-center flex flex-col items-center gap-4">
          <div className="size-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Clock className="size-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Время оплаты истекло</h1>
          <p className="text-muted-foreground">
            На оплату отводится 10 минут. Заказ отменён — оформите новый.
          </p>
          <Link href="/cart"><Button>Вернуться в корзину</Button></Link>
        </div>
      </div>
    );
  }

  // Цвет таймера: зелёный → жёлтый → красный
  const timerColor =
    timeLeft === null
      ? "text-muted-foreground"
      : timeLeft > 3 * 60 * 1000
      ? "text-emerald-600 dark:text-emerald-400"
      : timeLeft > 60 * 1000
      ? "text-amber-600 dark:text-amber-400"
      : "text-destructive";

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

          {/* Таймер */}
          {timeLeft !== null && (
            <div className="flex items-center justify-center gap-2 bg-secondary rounded-xl px-4 py-2.5">
              <Clock className={`size-4 shrink-0 ${timerColor}`} />
              <span className="text-sm text-muted-foreground">Время на оплату:</span>
              <span className={`font-mono font-bold text-base tabular-nums ${timerColor}`}>
                {formatCountdown(timeLeft)}
              </span>
            </div>
          )}

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
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="https://paykeeper.ru" target="_blank" rel="noopener noreferrer">
              <Image
                src="https://dolinamoloka.server.paykeeper.ru/img/paykeeper-logo.png"
                alt="Secured by PayKeeper"
                width={120}
                height={28}
                className="h-7 w-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </a>
            <Image src="/payment/logos.png" alt="Visa, Mastercard, Мир" width={160} height={28} className="h-7 w-auto object-contain" />
            <Image src="/payment/sbp.svg" alt="СБП" width={36} height={28} className="h-7 w-auto object-contain" />
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
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-3">
              <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2">
                <p className="text-xs text-destructive">{orderError}</p>
                <button
                  onClick={handleCancel}
                  className="text-xs text-destructive underline underline-offset-2 text-left"
                >
                  Вернуться и исправить данные
                </button>
              </div>
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

          {/* Отмена */}
          <button
            onClick={handleCancel}
            disabled={paying}
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto disabled:opacity-40"
          >
            <ArrowLeft className="size-3.5" />
            Отменить и вернуться к оформлению
          </button>
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

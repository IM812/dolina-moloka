"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { Loader2, ArrowRight, ShoppingCart, MapPin, Clock, Check } from "lucide-react";
import useSWR from "swr";
import { PICKUP_POINTS, formatPickupPoint, pickupMapUrl } from "@/lib/pickup-points";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
import Link from "next/link";
import Image from "next/image";

// Defined OUTSIDE component to avoid remounting on every render (fixes 1-char bug)
function FormField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const { data: settingsData } = useSWR("/api/settings/public", fetcher);
  const MIN_ORDER = Number(settingsData?.settings?.min_order_amount ?? 500);
  const belowMin = total < MIN_ORDER;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pickupPointId: "",
    comment: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedPoint = PICKUP_POINTS.find((p) => p.id === form.pickupPointId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Введите фамилию и имя";
    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) e.phone = "Введите номер телефона";
    else if (digits.length < 10) e.phone = "Номер должен содержать не менее 10 цифр";
    else if (digits.length > 11) e.phone = "Проверьте номер телефона";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Введите корректный email";
    if (!form.pickupPointId) e.pickupPointId = "Выберите точку выдачи";
    return e;
  };

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col items-center text-center gap-6">
          <div className="size-20 bg-secondary rounded-3xl flex items-center justify-center">
            <ShoppingCart className="size-10 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Корзина пуста</h1>
            <p className="text-muted-foreground">Добавьте продукты перед оформлением</p>
          </div>
          <Link href="/catalog">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Перейти в каталог
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id, // UUID из Supabase
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Save order data to sessionStorage — NOT written to DB until payment succeeds
      const pendingOrder = {
        customer: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          pickupAddress: selectedPoint ? formatPickupPoint(selectedPoint) : "",
          comment: form.comment,
        },
        items: orderItems,
        totalAmount: total,
      };
      sessionStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      router.push("/payment");
    } catch (err) {
      console.error("[checkout] error:", err);
      toast.error("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-5 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm" className="gap-2 border-border">
              <ArrowRight className="size-4 rotate-180" />
              <span className="hidden sm:inline">Назад в корзину</span>
              <span className="sm:hidden">Корзина</span>
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Оформление заказа</h1>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-5"
            >
              <h2 className="font-semibold text-foreground text-lg">Контактные данные</h2>

              <FormField label="Фамилия и имя" name="fullName" error={errors.fullName}>
                <Input
                  id="fullName"
                  placeholder="Иванов Иван"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  aria-invalid={!!errors.fullName}
                  className="bg-secondary border-border text-foreground"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Номер телефона" name="phone" error={errors.phone}>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 000-00-00"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    aria-invalid={!!errors.phone}
                    className="bg-secondary border-border text-foreground"
                  />
                </FormField>

                <FormField label="Электронная почта" name="email" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ivan@mail.ru"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    aria-invalid={!!errors.email}
                    className="bg-secondary border-border text-foreground"
                  />
                </FormField>
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-foreground text-lg">Точка выдачи</h2>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  Выберите удобную точку — заказ будет ждать вас в указанное время
                </p>
              </div>

              <fieldset
                className="flex flex-col gap-2.5"
                aria-invalid={!!errors.pickupPointId}
                aria-describedby={errors.pickupPointId ? "pickup-error" : undefined}
              >
                <legend className="sr-only">Точка выдачи заказа</legend>
                {PICKUP_POINTS.map((point, index) => {
                  const active = form.pickupPointId === point.id;
                  return (
                    <div
                      key={point.id}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        active
                          ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                          : "border-border bg-secondary hover:border-primary/40"
                      }`}
                    >
                      <label className="flex items-start gap-3 p-3.5 cursor-pointer">
                        <input
                          type="radio"
                          name="pickupPoint"
                          value={point.id}
                          checked={active}
                          onChange={() => setForm((prev) => ({ ...prev, pickupPointId: point.id }))}
                          className="sr-only"
                        />
                        <span
                          className={`size-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            active ? "border-primary bg-primary" : "border-muted-foreground/40"
                          }`}
                          aria-hidden="true"
                        >
                          {active && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
                        </span>

                        <span className="flex-1 min-w-0 flex flex-col gap-2">
                          <span className="flex items-baseline gap-2">
                            <span
                              className={`text-xs font-bold tabular-nums shrink-0 ${
                                active ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {index + 1}.
                            </span>
                            <span className="text-sm font-medium text-foreground leading-snug text-pretty">
                              {point.address}
                            </span>
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-xs font-semibold ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-foreground"
                            }`}
                          >
                            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                            {point.timeFrom}&nbsp;—&nbsp;{point.timeTo}
                          </span>
                        </span>
                      </label>

                      <a
                        href={pickupMapUrl(point)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 border-t border-border/60 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        Показать на карте
                        <span className="sr-only"> — {point.address}, откроется в новой вкладке</span>
                      </a>
                    </div>
                  );
                })}
                {errors.pickupPointId && (
                  <p id="pickup-error" className="text-xs text-destructive">
                    {errors.pickupPointId}
                  </p>
                )}
              </fieldset>

              <FormField label="Комментарий к заказу (необязательно)" name="comment">
                <Textarea
                  id="comment"
                  placeholder="Особые пожелания, код домофона, время доставки..."
                  value={form.comment}
                  onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  className="bg-secondary border-border resize-none text-foreground"
                />
              </FormField>
            </motion.div>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 sm:sticky sm:top-24 flex flex-col gap-4">
                <h2 className="font-semibold text-foreground text-lg">Ваш заказ</h2>

                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="size-12 bg-secondary rounded-xl overflow-hidden relative flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} шт.</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground flex-shrink-0">
                        {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Итого</span>
                  <span className="font-bold text-foreground text-xl">
                    {total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">В т.ч. НДС 10%</span>
                  <span className="text-xs text-muted-foreground">
                    {(total * 10 / 110).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽
                  </span>
                </div>

                {belowMin && (
                  <div className="bg-destructive/10 border border-destructive/25 rounded-xl px-4 py-3 text-sm text-destructive leading-snug">
                    Минимальный заказ — <span className="font-bold">600 ₽</span>. Не хватает{" "}
                    <span className="font-bold">{MIN_ORDER - total} ₽</span>.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || belowMin}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : (
                    <ArrowRight className="size-4" data-icon="inline-start" />
                  )}
                  {loading ? "Оформление..." : "Оформить заказ"}
                </Button>

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <Link href="/offer" className="text-primary hover:underline">публичной офертой</Link>{" "}
                  и{" "}
                  <Link href="/privacy" className="text-primary hover:underline">политикой конфиденциальности</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

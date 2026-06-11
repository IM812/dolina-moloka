"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { setLastOrderNumber, setCheckoutSession } from "@/lib/cookies";
import { pickupPoints } from "@/lib/mock-data";
import { toast } from "sonner";
import { Loader2, ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pickupAddress: "",
    comment: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Введите фамилию и имя";
    if (!form.phone.trim()) e.phone = "Введите номер телефона";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Введите корректный email";
    if (!form.pickupAddress) e.pickupAddress = "Выберите точку выдачи";
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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            pickupAddress: form.pickupAddress,
            comment: form.comment,
          },
          items: orderItems,
          totalAmount: total,
        }),
      });

      if (!res.ok) throw new Error("Ошибка создания заказа");
      const { order } = await res.json();

      // Save to cookies
      setLastOrderNumber(order.orderNumber);
      setCheckoutSession({ orderNumber: order.orderNumber, email: form.email });

      clearCart();
      router.push(`/payment?order=${order.orderNumber}`);
    } catch (err) {
      console.error("[checkout] error:", err);
      toast.error("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, name, error, children,
  }: { label: string; name: string; error?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-8">Оформление заказа</h1>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col gap-5"
            >
              <h2 className="font-semibold text-foreground text-lg">Контактные данные</h2>

              <Field label="Фамилия и имя" name="fullName" error={errors.fullName}>
                <Input
                  id="fullName"
                  placeholder="Иванов Иван"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  aria-invalid={!!errors.fullName}
                  className="bg-secondary border-border"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Номер телефона" name="phone" error={errors.phone}>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 000-00-00"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    aria-invalid={!!errors.phone}
                    className="bg-secondary border-border"
                  />
                </Field>

                <Field label="Электронная почта" name="email" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ivan@mail.ru"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    aria-invalid={!!errors.email}
                    className="bg-secondary border-border"
                  />
                </Field>
              </div>

              <Separator className="bg-border" />

              <h2 className="font-semibold text-foreground text-lg">Точка выдачи</h2>

              <Field label="Адрес точки самовывоза" name="pickupAddress" error={errors.pickupAddress}>
                <Select
                  value={form.pickupAddress}
                  onValueChange={(v) => setForm({ ...form, pickupAddress: v })}
                >
                  <SelectTrigger id="pickupAddress" aria-invalid={!!errors.pickupAddress} className="bg-secondary border-border">
                    <SelectValue placeholder="Выберите адрес" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupPoints.map((point) => (
                      <SelectItem key={point} value={point}>{point}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Комментарий к заказу (необязательно)" name="comment">
                <Textarea
                  id="comment"
                  placeholder="Особые пожелания, время получения..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  className="bg-secondary border-border resize-none"
                />
              </Field>
            </motion.div>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 flex flex-col gap-4">
                <h2 className="font-semibold text-foreground text-lg">Ваш заказ</h2>

                <div className="flex flex-col gap-3">
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
                        <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} шт.</p>
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

                <Button
                  type="submit"
                  disabled={loading}
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

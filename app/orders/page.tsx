"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, ArrowRight, CheckCircle2, Clock, ChefHat, ShoppingBag, XCircle, Phone } from "lucide-react";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Delivery progress
// ---------------------------------------------------------------------------

const DELIVERY_STEPS = [
  { key: "new",        label: "Принят",        icon: CheckCircle2 },
  { key: "processing", label: "Готовится",      icon: ChefHat      },
  { key: "completed",  label: "Готов к выдаче", icon: ShoppingBag  },
];
const deliveryOrder = ["new", "processing", "completed"];

function DeliveryProgress({ status }: { status: string }) {
  const currentIdx = deliveryOrder.indexOf(status);
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="size-4" /> Заказ отменён
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0 w-full">
      {DELIVERY_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "size-9 rounded-full flex items-center justify-center border-2 transition-colors",
                done ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
              )}>
                <Icon className="size-4" />
              </div>
              <span className={cn(
                "text-xs text-center leading-tight max-w-[64px]",
                active ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {idx < DELIVERY_STEPS.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mb-5 mx-1 transition-colors",
                idx < currentIdx ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single order card
// ---------------------------------------------------------------------------

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const isPaid = order.paymentStatus === "paid";
  const date = new Date(order.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
  const time = new Date(order.createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">Заказ {order.orderNumber}</CardTitle>
            <CardDescription className="mt-0.5">{date} в {time}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isPaid ? "default" : "secondary"} className="text-xs px-2.5 py-1">
              {isPaid
                ? <><CheckCircle2 className="size-3 mr-1" />Оплачен</>
                : <><Clock className="size-3 mr-1" />Ожидает оплаты</>
              }
            </Badge>
            <span className="text-base font-bold text-foreground">{order.totalAmount.toLocaleString("ru-RU")} ₽</span>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="flex flex-col gap-5 pt-0">
          {/* Delivery progress */}
          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium mb-4 uppercase tracking-wide">Статус</p>
            <DeliveryProgress status={order.deliveryStatus} />
          </div>

          {/* Items */}
          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <div key={item.productId ?? idx} className="flex items-center gap-3">
                <div className="size-11 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src={`/products/${
                      item.productName?.toLowerCase().includes("кефир") ? "kefir-pet" :
                      item.productName?.toLowerCase().includes("греч") ? "yogurt-greek" :
                      item.productName?.toLowerCase().includes("малин") ? "yogurt-raspberry" :
                      item.productName?.toLowerCase().includes("черник") ? "yogurt-blueberry" :
                      item.productName?.toLowerCase().includes("творог") ? "tvorog-cup" :
                      item.productName?.toLowerCase().includes("сметан") ? "smetana-cup" :
                      item.productName?.toLowerCase().includes("масл") ? "butter-200g" :
                      "milk-1l"
                    }.png`}
                    alt={item.productName}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} шт. × {item.price} ₽</p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</span>
              </div>
            ))}
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Итого</span>
            <span className="text-lg font-bold text-foreground">{order.totalAmount.toLocaleString("ru-RU")} ₽</span>
          </div>
        </CardContent>
      )}

      {!expanded && (
        <CardContent className="pt-0 pb-3">
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-primary hover:underline"
          >
            Показать детали
          </button>
        </CardContent>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) return;

    // Normalize: keep digits only, replace leading 8 → 7
    const digits = trimmed.replace(/\D/g, "");
    const normalized = digits.startsWith("8") && digits.length === 11
      ? "7" + digits.slice(1)
      : digits;

    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const res = await fetch("/api/orders/by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка поиска");
      setOrders(data.orders ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Мои заказы</h1>
        <p className="text-muted-foreground mt-2">
          Введите номер телефона, указанный при оформлении
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Номер телефона
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2 shrink-0">
              {loading ? (
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Найти
            </Button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Найдено заказов: <span className="font-semibold text-foreground">{orders.length}</span>
          </p>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Empty result */}
      {!loading && searched && orders.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 border border-border rounded-2xl">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center">
            <Package className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Заказы не найдены</p>
            <p className="text-sm text-muted-foreground mt-1">
              Проверьте номер телефона или оформите новый заказ
            </p>
          </div>
          <Link href="/catalog">
            <Button variant="outline" className="gap-2 border-border">
              В каталог <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Initial state */}
      {!loading && !searched && !error && (
        <div className="flex flex-col items-center gap-4 py-12 border border-border rounded-2xl">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center">
            <Phone className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Введите номер телефона</p>
            <p className="text-sm text-muted-foreground mt-1">
              Все ваши заказы привязаны к номеру телефона
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Search, Package, ArrowRight, CheckCircle2, Clock, ChefHat, ShoppingBag, XCircle } from "lucide-react";
import type { Order } from "@/types";
import { getLastOrderNumber } from "@/lib/cookies";
import { cn } from "@/lib/utils";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("not found");
    return r.json();
  });

const DELIVERY_STEPS = [
  { key: "new",        label: "Принят",           icon: CheckCircle2 },
  { key: "processing", label: "Готовится",         icon: ChefHat      },
  { key: "completed",  label: "Готов к выдаче",    icon: ShoppingBag  },
];

const deliveryOrder = ["new", "processing", "completed"];

function DeliveryProgress({ status }: { status: string }) {
  const currentIdx = deliveryOrder.indexOf(status);
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="size-4" />
        Заказ отменён
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
                done
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground"
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

function OrderResult({ orderNumber }: { orderNumber: string }) {
  const { data, error, isLoading } = useSWR<{ order: Order }>(
    orderNumber ? `/api/orders/${orderNumber}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.order) {
    return (
      <Empty className="border border-border rounded-xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Заказ не найден</EmptyTitle>
          <EmptyDescription>
            Проверьте номер заказа и попробуйте снова
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const order = data.order;
  const isPaid = order.paymentStatus === "paid";
  const date = new Date(order.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric"
  });
  const time = new Date(order.createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <Card className="border-border overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-xl">Заказ {order.orderNumber}</CardTitle>
            <CardDescription className="mt-0.5">
              {date} в {time}
            </CardDescription>
          </div>
          <Badge
            variant={isPaid ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {isPaid ? (
              <><CheckCircle2 className="size-3.5 mr-1.5" />Оплачен</>
            ) : (
              <><Clock className="size-3.5 mr-1.5" />Ожидает оплаты</>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Delivery progress */}
        <div className="bg-muted/40 rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-4 uppercase tracking-wide">Статус доставки</p>
          <DeliveryProgress status={order.deliveryStatus} />
        </div>

        {/* Items */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wide">Состав заказа</p>
          <div className="flex flex-col gap-3">
            {order.items.map((item: Order["items"][number], idx: number) => (
              <div key={item.productId ?? idx} className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  <Image
                    src={`/products/${item.productId ? "" : ""}${item.productName?.toLowerCase().includes("молок") ? "milk-1l" : item.productName?.toLowerCase().includes("кефир") ? "kefir-pet" : item.productName?.toLowerCase().includes("йогурт") && item.productName?.toLowerCase().includes("греч") ? "yogurt-greek" : item.productName?.toLowerCase().includes("малин") ? "yogurt-raspberry" : item.productName?.toLowerCase().includes("черник") ? "yogurt-blueberry" : item.productName?.toLowerCase().includes("творог") ? "tvorog-cup" : item.productName?.toLowerCase().includes("сметан") ? "smetana-cup" : item.productName?.toLowerCase().includes("масл") ? "butter-200g" : "milk-1l"}.png`}
                    alt={item.productName}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} шт. × {item.price} ₽</p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {item.price * item.quantity} ₽
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-foreground">Итого</span>
          <span className="text-2xl font-bold text-foreground">{order.totalAmount} ₽</span>
        </div>

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center">
          Вопросы по заказу? Позвоните нам или напишите в WhatsApp
        </p>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState<string>(
    () => getLastOrderNumber() ?? ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchValue(query.trim());
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Мои заказы</h1>
        <p className="text-muted-foreground mt-2">
          Введите номер заказа, чтобы отследить его статус
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="orderNumber">Номер заказа</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="orderNumber"
                placeholder="Например, DM-000123"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" className="gap-2 shrink-0">
                <Search data-icon="inline-start" />
                Найти
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>

      {searchValue ? (
        <OrderResult orderNumber={searchValue} />
      ) : (
        <Empty className="border border-border rounded-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>Введите номер заказа</EmptyTitle>
            <EmptyDescription>
              Номер указан в письме после оплаты
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/catalog">
              <Button variant="outline" className="gap-2 border-border">
                В каталог
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

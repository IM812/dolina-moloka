"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
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
import { Search, Package, ArrowRight } from "lucide-react";
import type { Order } from "@/types";
import { getLastOrderNumber } from "@/lib/cookies";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("not found");
    return r.json();
  });

const paymentLabels: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  cancelled: "Отменён",
};

const deliveryLabels: Record<string, string> = {
  pending: "Принят",
  processing: "Готовится",
  ready: "Готов к выдаче",
  delivered: "Выдан",
};

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
        <CardContent className="flex flex-col gap-3">
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

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg">Заказ {order.orderNumber}</CardTitle>
            <CardDescription>
              от {new Date(order.createdAt).toLocaleDateString("ru-RU")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={order.paymentStatus === "paid" ? "default" : "secondary"}
            >
              {paymentLabels[order.paymentStatus]}
            </Badge>
            <Badge variant="outline">
              {deliveryLabels[order.deliveryStatus]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {order.items.map((item: Order["items"][number]) => (
            <div
              key={item.productId}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-foreground">
                {item.productName}{" "}
                <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="font-medium text-foreground">
                {item.price * item.quantity} ₽
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">Итого</span>
          <span className="text-lg font-bold text-foreground">
            {order.totalAmount} ₽
          </span>
        </div>
        <Separator />
        <div className="text-sm text-muted-foreground flex flex-col gap-1">
          <p>
            <span className="text-foreground">Получатель:</span>{" "}
            {order.customer.fullName}
          </p>
          <p>
            <span className="text-foreground">Самовывоз:</span>{" "}
            {order.customer.pickupAddress}
          </p>
        </div>
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

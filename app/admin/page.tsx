"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  PackageCheck,
  Banknote,
  ShoppingCart,
  Users,
} from "lucide-react";

const PAYMENT_LABELS: Record<Order["paymentStatus"], string> = {
  pending: "Ожидает",
  paid: "Оплачен",
  cancelled: "Отменён",
};

const PAYMENT_COLORS: Record<Order["paymentStatus"], string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const DELIVERY_LABELS: Record<Order["deliveryStatus"], string> = {
  pending: "Принят",
  processing: "Готовится",
  ready: "Готов",
  delivered: "Выдан",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(({ orders }) => setOrders(orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.paymentStatus === statusFilter);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter(
    (o) => o.paymentStatus === "paid"
  ).length;
  const uniqueCustomers = new Set(orders.map((o) => o.customer.phone)).size;

  return (
    <main className="min-h-screen bg-secondary py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Панель администратора
            </h1>
            <p className="text-muted-foreground text-sm">Управление заказами</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Всего заказов",
              value: loading ? "—" : totalOrders,
              icon: <ShoppingCart className="size-5 text-primary" />,
            },
            {
              label: "Оплачено",
              value: loading ? "—" : paidOrders,
              icon: <PackageCheck className="size-5 text-green-600" />,
            },
            {
              label: "Выручка",
              value: loading
                ? "—"
                : `${totalRevenue.toLocaleString("ru-RU")} ₽`,
              icon: <Banknote className="size-5 text-blue-600" />,
            },
            {
              label: "Клиенты",
              value: loading ? "—" : uniqueCustomers,
              icon: <Users className="size-5 text-orange-600" />,
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-border shadow-sm">
              <CardContent className="flex items-center gap-4 pt-5 pb-5">
                <div className="size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders table */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Заказы</CardTitle>
                <CardDescription>
                  Все входящие заказы клиентов
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
                <SelectTrigger className="w-44 border-border">
                  <SelectValue placeholder="Фильтр статуса" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <Separator className="bg-border" />
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col gap-3 p-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">
                Заказов нет
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Номер заказа</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Товары</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Оплата</TableHead>
                      <TableHead>Доставка</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filtered].reverse().map((order) => (
                      <TableRow key={order.id} className="border-border">
                        <TableCell className="font-mono text-xs font-semibold text-foreground">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-foreground">
                            {order.customer.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {order.items.map((item) => (
                              <span
                                key={item.productId}
                                className="text-xs text-muted-foreground"
                              >
                                {item.productName} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {order.totalAmount.toLocaleString("ru-RU")} ₽
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_COLORS[order.paymentStatus]}`}
                          >
                            {PAYMENT_LABELS[order.paymentStatus]}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {DELIVERY_LABELS[order.deliveryStatus]}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(
                            "ru-RU",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

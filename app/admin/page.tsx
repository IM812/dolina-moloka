"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, PackageCheck, Banknote, ShoppingCart, Users, Lock, RefreshCw, Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import Image from "next/image";

const ADMIN_PASSWORD = "dolina2024";

const PAYMENT_LABELS: Record<Order["paymentStatus"], string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  cancelled: "Отменён",
};

const PAYMENT_COLORS: Record<Order["paymentStatus"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const DELIVERY_LABELS: Record<Order["deliveryStatus"], string> = {
  pending: "Принят",
  processing: "Готовится",
  ready: "Готов",
  delivered: "Доставлен",
};

const DELIVERY_COLORS: Record<Order["deliveryStatus"], string> = {
  pending: "bg-secondary text-muted-foreground border-border",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// --- Login gate ---
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="size-16 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
              <Lock className="size-7 text-background" />
            </div>
            <Image src="/logo.jpg" alt="Долина молока" width={100} height={40} className="h-10 w-auto object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Панель администратора</h1>
            <p className="text-muted-foreground text-sm mt-1">Введите пароль для входа</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Пароль</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                aria-invalid={error}
                className="bg-secondary border-border"
                autoFocus
              />
              {error && <p className="text-xs text-destructive">Неверный пароль</p>}
            </div>
            <Button type="submit" className="w-full bg-foreground hover:bg-foreground/80 text-background">
              Войти
            </Button>
          </form>
        </div>
    </div>
  );
}

// --- Main dashboard ---
function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/orders");
      const { orders } = await res.json();
      setOrders(orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const filtered = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.paymentStatus === statusFilter);

  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid").length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending").length;
  const uniqueCustomers = new Set(orders.map((o) => o.customer.phone)).size;

  const stats = [
    { label: "Всего заказов", value: loading ? "—" : totalOrders, icon: <ShoppingCart className="size-5 text-primary" />, color: "bg-primary/10" },
    { label: "Оплачено", value: loading ? "—" : paidOrders, icon: <PackageCheck className="size-5 text-emerald-600" />, color: "bg-emerald-100" },
    { label: "Ожидают оплаты", value: loading ? "—" : pendingOrders, icon: <Banknote className="size-5 text-amber-600" />, color: "bg-amber-100" },
    { label: "Выручка", value: loading ? "—" : `${totalRevenue.toLocaleString("ru-RU")} ₽`, icon: <Banknote className="size-5 text-blue-600" />, color: "bg-blue-100" },
    { label: "Клиенты", value: loading ? "—" : uniqueCustomers, icon: <Users className="size-5 text-violet-600" />, color: "bg-violet-100" },
  ];

  return (
    <main className="min-h-screen bg-secondary py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Долина молока" width={80} height={32} className="h-8 w-auto object-contain" />
            <Separator orientation="vertical" className="h-6 bg-border" />
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                Панель администратора
              </h1>
              <p className="text-muted-foreground text-xs">Управление заказами Долина молока</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={refreshing} className="gap-2 border-border">
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} data-icon="inline-start" />
            Обновить
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className={`size-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
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
                <CardTitle className="font-heading">Заказы</CardTitle>
                <CardDescription>Все входящие заказы — сначала новые</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
                <SelectTrigger className="w-48 border-border">
                  <SelectValue placeholder="Фильтр статуса" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <Separator className="bg-border" />
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col gap-3 p-6">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground text-sm">
                Нет заказов
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-secondary/60">
                      <TableHead className="font-semibold">Заказ</TableHead>
                      <TableHead className="font-semibold">Клиент</TableHead>
                      <TableHead className="font-semibold">Адрес</TableHead>
                      <TableHead className="font-semibold">Товары</TableHead>
                      <TableHead className="font-semibold text-right">Сумма</TableHead>
                      <TableHead className="font-semibold">Оплата</TableHead>
                      <TableHead className="font-semibold">Статус</TableHead>
                      <TableHead className="font-semibold">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filtered].reverse().map((order) => (
                      <TableRow key={order.id} className="border-border hover:bg-secondary/40 transition-colors">
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-foreground bg-secondary px-2 py-1 rounded-lg">
                            {order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-foreground">{order.customer.fullName}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="size-3" />
                            {order.customer.phone}
                          </div>
                          {order.customer.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Mail className="size-3" />
                              {order.customer.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[140px]">
                            <MapPin className="size-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{order.customer.pickupAddress || "—"}</span>
                          </div>
                          {order.customer.comment && (
                            <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1 max-w-[140px]">
                              <MessageSquare className="size-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2 italic">{order.customer.comment}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5 min-w-[160px]">
                            {order.items.map((item) => (
                              <span key={item.productId} className="text-xs text-muted-foreground">
                                {item.productName} <span className="font-medium text-foreground">× {item.quantity}</span>
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-foreground text-sm whitespace-nowrap">
                            {order.totalAmount.toLocaleString("ru-RU")} ₽
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PAYMENT_COLORS[order.paymentStatus]}`}>
                            {PAYMENT_LABELS[order.paymentStatus]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${DELIVERY_COLORS[order.deliveryStatus]}`}>
                            {DELIVERY_LABELS[order.deliveryStatus]}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })}
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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginGate onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard />;
}

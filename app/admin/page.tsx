"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, PackageCheck, Banknote, ShoppingCart,
  Users, RefreshCw, Phone, Mail, MapPin, MessageSquare, LogOut,
} from "lucide-react";
import Image from "next/image";

type DbOrder = {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  delivery_status: string;
  comment: string | null;
  created_at: string;
  customers: {
    full_name: string;
    phone: string;
    email: string | null;
    pickup_address: string | null;
  } | null;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
  }[];
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  cancelled: "Отменён",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const DELIVERY_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "Готовится",
  completed: "Выполнен",
  cancelled: "Отменён",
};

const DELIVERY_COLORS: Record<string, string> = {
  new: "bg-secondary text-muted-foreground border-border",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/admin/login");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  const loadOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, customers(*), order_items(*)")
        .order("created_at", { ascending: false });
      setOrders((data as DbOrder[]) ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked) loadOrders();
  }, [authChecked, loadOrders]);

  const handleStatusChange = async (orderNumber: string, field: "paymentStatus" | "deliveryStatus", value: string) => {
    await fetch(`/api/orders/${orderNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    loadOrders();
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-6 animate-spin" />
          <span className="text-sm">Загрузка...</span>
        </div>
      </div>
    );
  }

  const filtered = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.payment_status === statusFilter);

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customers?.phone)).size;

  const stats = [
    { label: "Всего заказов", value: loading ? "—" : orders.length, icon: <ShoppingCart className="size-5 text-primary" />, color: "bg-primary/10" },
    { label: "Оплачено", value: loading ? "—" : orders.filter((o) => o.payment_status === "paid").length, icon: <PackageCheck className="size-5 text-emerald-600" />, color: "bg-emerald-100" },
    { label: "Ожидают оплаты", value: loading ? "—" : orders.filter((o) => o.payment_status === "pending").length, icon: <Banknote className="size-5 text-amber-600" />, color: "bg-amber-100" },
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadOrders} disabled={refreshing} className="gap-2 border-border">
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
              Обновить
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-border text-destructive hover:text-destructive">
              <LogOut className="size-4" />
              Выйти
            </Button>
          </div>
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
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
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
              <div className="py-20 text-center text-muted-foreground text-sm">Нет заказов</div>
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
                      <TableHead className="font-semibold">Доставка</TableHead>
                      <TableHead className="font-semibold">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order) => (
                      <TableRow key={order.id} className="border-border hover:bg-secondary/40 transition-colors">
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-foreground bg-secondary px-2 py-1 rounded-lg">
                            {order.order_number}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-foreground">{order.customers?.full_name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="size-3" />{order.customers?.phone}
                          </div>
                          {order.customers?.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Mail className="size-3" />{order.customers.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[140px]">
                            <MapPin className="size-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{order.customers?.pickup_address || "—"}</span>
                          </div>
                          {order.comment && (
                            <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1 max-w-[140px]">
                              <MessageSquare className="size-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2 italic">{order.comment}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5 min-w-[160px]">
                            {order.order_items.map((item) => (
                              <span key={item.id} className="text-xs text-muted-foreground">
                                {item.product_name} <span className="font-medium text-foreground">× {item.quantity}</span>
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-foreground text-sm whitespace-nowrap">
                            {order.total_amount.toLocaleString("ru-RU")} ₽
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.payment_status}
                            onValueChange={(v) => handleStatusChange(order.order_number, "paymentStatus", v)}
                          >
                            <SelectTrigger className={`w-36 h-7 text-xs border rounded-full px-2 ${PAYMENT_COLORS[order.payment_status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.delivery_status}
                            onValueChange={(v) => handleStatusChange(order.order_number, "deliveryStatus", v)}
                          >
                            <SelectTrigger className={`w-32 h-7 text-xs border rounded-full px-2 ${DELIVERY_COLORS[order.delivery_status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DELIVERY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("ru-RU", {
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

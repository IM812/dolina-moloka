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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import {
  ShieldCheck, PackageCheck, Banknote, ShoppingCart,
  Users, RefreshCw, Phone, Mail, MapPin, MessageSquare, LogOut,
  Search, TrendingUp, Package, User, ChevronDown, ChevronUp,
  Tag, Plus, Pencil, Trash2, Eye, EyeOff, Calendar,
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
  customers: { full_name: string; phone: string; email: string | null; pickup_address: string | null } | null;
  order_items: { id: string; product_name: string; quantity: number; price: number }[];
};

const PAYMENT_LABELS: Record<string, string> = { pending: "Ожидает", paid: "Оплачен", cancelled: "Отменён" };
const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};
const DELIVERY_LABELS: Record<string, string> = { new: "Новый", processing: "Готовится", completed: "Выполнен", cancelled: "Отменён" };
const DELIVERY_COLORS: Record<string, string> = {
  new: "bg-secondary text-muted-foreground border-border",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function RevenueChart({ orders }: { orders: DbOrder[] }) {
  const paid = orders.filter((o) => o.payment_status === "paid");
  const days: Record<string, { revenue: number; count: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    days[key] = { revenue: 0, count: 0 };
  }
  paid.forEach((o) => {
    const key = new Date(o.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    if (days[key]) { days[key].revenue += o.total_amount; days[key].count += 1; }
  });
  const data = Object.entries(days).map(([date, v]) => ({ date, ...v }));

  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  paid.forEach((o) => o.order_items.forEach((item) => {
    if (!productMap[item.product_name]) productMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
    productMap[item.product_name].qty += item.quantity;
    productMap[item.product_name].revenue += item.price * item.quantity;
  }));
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const totalRevenue = paid.reduce((s, o) => s + o.total_amount, 0);
  const avgOrder = paid.length ? Math.round(totalRevenue / paid.length) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Выручка всего", value: `${totalRevenue.toLocaleString("ru-RU")} ₽`, icon: <Banknote className="size-4 text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Оплачено заказов", value: paid.length, icon: <PackageCheck className="size-4 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Средний чек", value: `${avgOrder.toLocaleString("ru-RU")} ₽`, icon: <TrendingUp className="size-4 text-primary" />, bg: "bg-primary/10" },
          { label: "Товаров продано", value: paid.reduce((s, o) => s + o.order_items.reduce((ss, i) => ss + i.quantity, 0), 0), icon: <Package className="size-4 text-amber-600" />, bg: "bg-amber-50" },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`size-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Выручка за 14 дней</CardTitle>
          <CardDescription>Только оплаченные заказы</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ revenue: { label: "Выручка, ₽", color: "var(--chart-1)" } }} className="h-56 w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}₽`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#rg)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      {topProducts.length > 0 && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Топ товаров по выручке</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ revenue: { label: "Выручка, ₽", color: "var(--chart-2)" } }} className="h-48 w-full">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}₽`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CustomersTab({ orders }: { orders: DbOrder[] }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const customerMap: Record<string, { phone: string; name: string; email: string | null; address: string | null; orders: DbOrder[] }> = {};
  orders.forEach((o) => {
    const phone = o.customers?.phone ?? "unknown";
    if (!customerMap[phone]) customerMap[phone] = { phone, name: o.customers?.full_name ?? "—", email: o.customers?.email ?? null, address: o.customers?.pickup_address ?? null, orders: [] };
    customerMap[phone].orders.push(o);
  });
  const customers = Object.values(customerMap)
    .sort((a, b) => b.orders.length - a.orders.length)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Поиск по имени или телефону..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-border" />
      </div>
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary/60">
                <TableHead className="font-semibold">Клиент</TableHead>
                <TableHead className="font-semibold">Телефон</TableHead>
                <TableHead className="font-semibold">Заказов</TableHead>
                <TableHead className="font-semibold text-right">Потрачено</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-16 text-muted-foreground">Клиенты не найдены</TableCell></TableRow>
              ) : customers.flatMap((c) => {
                const spent = c.orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0);
                const open = expanded === c.phone;
                return [
                  <TableRow key={c.phone} className="border-border hover:bg-secondary/40 cursor-pointer" onClick={() => setExpanded(open ? null : c.phone)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><User className="size-4 text-primary" /></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{c.name}</p>
                          {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.phone}</TableCell>
                    <TableCell><Badge variant="secondary">{c.orders.length}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{spent.toLocaleString("ru-RU")} ₽</TableCell>
                    <TableCell>{open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}</TableCell>
                  </TableRow>,
                  ...(open ? [
                    <TableRow key={`${c.phone}-d`} className="bg-secondary/30">
                      <TableCell colSpan={5} className="py-3 px-6">
                        <div className="flex flex-col gap-2">
                          {c.address && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{c.address}</p>}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {c.orders.map((o) => (
                              <div key={o.id} className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <span className="font-mono font-semibold">{o.order_number}</span>
                                <span className="text-muted-foreground">{o.total_amount.toLocaleString("ru-RU")} ₽</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] border ${PAYMENT_COLORS[o.payment_status]}`}>{PAYMENT_LABELS[o.payment_status]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ] : [])
                ];
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersTab({ orders, onStatusChange }: { orders: DbOrder[]; onStatusChange: (num: string, field: "paymentStatus" | "deliveryStatus", value: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = orders
    .filter((o) => filter === "all" || o.payment_status === filter)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return o.order_number.toLowerCase().includes(q) || o.customers?.full_name?.toLowerCase().includes(q) || o.customers?.phone?.includes(q);
    });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Номер, имя, телефон..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-border" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(PAYMENT_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
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
                    <TableHead className="font-semibold">Статус</TableHead>
                    <TableHead className="font-semibold">Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-secondary/40 transition-colors">
                      <TableCell><span className="font-mono text-xs font-semibold text-foreground bg-secondary px-2 py-1 rounded-lg">{order.order_number}</span></TableCell>
                      <TableCell>
                        <div className="font-medium text-sm text-foreground">{order.customers?.full_name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><Phone className="size-3" />{order.customers?.phone}</div>
                        {order.customers?.email && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><Mail className="size-3" />{order.customers.email}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[140px]"><MapPin className="size-3 mt-0.5 shrink-0" /><span className="line-clamp-2">{order.customers?.pickup_address || "—"}</span></div>
                        {order.comment && <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1 max-w-[140px]"><MessageSquare className="size-3 mt-0.5 shrink-0" /><span className="line-clamp-2 italic">{order.comment}</span></div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 min-w-[160px]">
                          {order.order_items.map((item) => <span key={item.id} className="text-xs text-muted-foreground">{item.product_name} <span className="font-medium text-foreground">× {item.quantity}</span></span>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right"><span className="font-bold text-foreground text-sm whitespace-nowrap">{order.total_amount.toLocaleString("ru-RU")} ₽</span></TableCell>
                      <TableCell>
                        <Select value={order.payment_status} onValueChange={(v) => onStatusChange(order.order_number, "paymentStatus", v)}>
                          <SelectTrigger className={`w-32 h-7 text-xs border rounded-full px-2 ${PAYMENT_COLORS[order.payment_status]}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(PAYMENT_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={order.delivery_status} onValueChange={(v) => onStatusChange(order.order_number, "deliveryStatus", v)}>
                          <SelectTrigger className={`w-32 h-7 text-xs border rounded-full px-2 ${DELIVERY_COLORS[order.delivery_status]}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{Object.entries(DELIVERY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmailTab() {
  const [smtp, setSmtp] = useState({ host: "", port: "587", user: "", pass: "", to: "" });
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setSmtp({
      host: process.env.NEXT_PUBLIC_SMTP_HOST ?? "",
      port: "587",
      user: process.env.NEXT_PUBLIC_SMTP_USER ?? "",
      pass: "",
      to: process.env.NEXT_PUBLIC_SMTP_TO ?? "",
    });
  }, []);

  const handleTest = async () => {
    setTesting(true); setResult(null);
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(smtp) });
      const data = await res.json();
      setResult(data.ok ? "Письмо отправлено успешно" : `Ошибка: ${data.error}`);
    } catch { setResult("Ошибка соединения"); }
    finally { setTesting(false); }
  };

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Mail className="size-4 text-primary" />SMTP настройки</CardTitle>
          <CardDescription>Уведомления при новых заказах. Настройте переменные среды в Vercel: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_TO.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">SMTP хост</label>
              <Input placeholder="smtp.gmail.com" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} className="border-border" />
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground mb-1 block">Порт</label>
              <Input placeholder="587" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} className="border-border" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email отправителя</label>
            <Input placeholder="shop@dolina-moloka.ru" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} className="border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Пароль / App Password</label>
            <Input type="password" placeholder="••••••••" value={smtp.pass} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} className="border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Получатель уведомлений</label>
            <Input placeholder="admin@dolina-moloka.ru" value={smtp.to} onChange={(e) => setSmtp({ ...smtp, to: e.target.value })} className="border-border" />
          </div>
          <Separator className="bg-border" />
          <Button onClick={handleTest} disabled={testing || !smtp.host || !smtp.user} variant="outline" className="border-border gap-2 self-start">
            {testing ? <RefreshCw className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Отправить тест
          </Button>
          {result && (
            <p className={`text-sm px-3 py-2 rounded-lg border ${result.startsWith("Ошибка") ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{result}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type Promotion = {
  id: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  discount_percent: number | null;
  active_from: string | null;
  active_until: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
  created_at: string;
};

const EMPTY_PROMO: Omit<Promotion, "id" | "created_at"> = {
  title: "", description: "", badge_text: "", discount_percent: null,
  active_from: "", active_until: "", is_active: true, show_on_homepage: true,
};

function PromotionsTab() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Promotion> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/promotions");
    const data = await res.json();
    setPromotions(data.promotions ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing || !editing.title) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const payload = { ...editing };
      if (!payload.active_from) payload.active_from = null;
      if (!payload.active_until) payload.active_until = null;
      if (!payload.discount_percent) payload.discount_percent = null;
      if (!payload.badge_text) payload.badge_text = null;
      if (!payload.description) payload.description = null;

      if (isNew) {
        await fetch("/api/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`/api/promotions/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      setEditing(null);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить акцию?")) return;
    await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggle = async (promo: Promotion) => {
    await fetch(`/api/promotions/${promo.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !promo.is_active }) });
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{promotions.length} акций в базе</p>
        <Button size="sm" onClick={() => setEditing({ ...EMPTY_PROMO })} className="gap-2">
          <Plus className="size-4" />Добавить акцию
        </Button>
      </div>

      {/* Form */}
      {editing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editing.id ? "Редактировать акцию" : "Новая акция"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Название *</label>
                <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Летняя скидка на молоко" className="border-border" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
                <Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Подробное описание акции..." className="border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Текст бейджа</label>
                <Input value={editing.badge_text ?? ""} onChange={(e) => setEditing({ ...editing, badge_text: e.target.value })} placeholder="Скидка 15%" className="border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Скидка, %</label>
                <Input type="number" value={editing.discount_percent ?? ""} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value ? Number(e.target.value) : null })} placeholder="15" className="border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="size-3" />Начало</label>
                <Input type="date" value={editing.active_from ?? ""} onChange={(e) => setEditing({ ...editing, active_from: e.target.value })} className="border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Calendar className="size-3" />Конец</label>
                <Input type="date" value={editing.active_until ?? ""} onChange={(e) => setEditing({ ...editing, active_until: e.target.value })} className="border-border" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="accent-primary" />
                Активна
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={!!editing.show_on_homepage} onChange={(e) => setEditing({ ...editing, show_on_homepage: e.target.checked })} className="accent-primary" />
                Показывать на главной
              </label>
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving || !editing.title} size="sm" className="gap-2">
                {saving ? <RefreshCw className="size-3 animate-spin" /> : null}
                Сохранить
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(null)} className="border-border">Отмена</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 flex flex-col gap-3">{[1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : promotions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">Акций пока нет. Добавьте первую.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-secondary/60">
                  <TableHead className="font-semibold">Название</TableHead>
                  <TableHead className="font-semibold">Бейдж</TableHead>
                  <TableHead className="font-semibold">Период</TableHead>
                  <TableHead className="font-semibold">На главной</TableHead>
                  <TableHead className="font-semibold">Статус</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id} className="border-border hover:bg-secondary/40">
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{promo.title}</p>
                      {promo.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{promo.description}</p>}
                    </TableCell>
                    <TableCell>
                      {promo.badge_text ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{promo.badge_text}</span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {promo.active_from && <span>{new Date(promo.active_from).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</span>}
                      {promo.active_from && promo.active_until && " — "}
                      {promo.active_until && <span>{new Date(promo.active_until).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</span>}
                      {!promo.active_from && !promo.active_until && <span className="text-emerald-600">Бессрочная</span>}
                    </TableCell>
                    <TableCell>
                      {promo.show_on_homepage
                        ? <span className="text-xs text-emerald-600 flex items-center gap-1"><Eye className="size-3" />Да</span>
                        : <span className="text-xs text-muted-foreground flex items-center gap-1"><EyeOff className="size-3" />Нет</span>}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggle(promo)} className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${promo.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-secondary text-muted-foreground border-border hover:bg-muted"}`}>
                        {promo.is_active ? "Активна" : "Выкл."}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(promo)} className="size-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Редактировать">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => handleDelete(promo.id)} className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors" title="Удалить">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/admin/login");
      else setAuthChecked(true);
    });
  }, [router]);

  const loadOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from("orders").select("*, customers(*), order_items(*)").order("created_at", { ascending: false });
      setOrders((data as DbOrder[]) ?? []);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (authChecked) loadOrders(); }, [authChecked, loadOrders]);

  const handleStatusChange = async (orderNumber: string, field: "paymentStatus" | "deliveryStatus", value: string) => {
    await fetch(`/api/orders/${orderNumber}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
    loadOrders();
  };

  const handleLogout = async () => { await createClient().auth.signOut(); router.push("/admin/login"); };

  if (!authChecked) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <RefreshCw className="size-6 animate-spin" /><span className="text-sm">Загрузка...</span>
      </div>
    </div>
  );

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total_amount, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customers?.phone)).size;
  const pendingCount = orders.filter((o) => o.payment_status === "pending").length;

  const stats = [
    { label: "Заказов", value: loading ? "—" : orders.length, icon: <ShoppingCart className="size-5 text-primary" />, bg: "bg-primary/10" },
    { label: "Оплачено", value: loading ? "—" : orders.filter((o) => o.payment_status === "paid").length, icon: <PackageCheck className="size-5 text-emerald-600" />, bg: "bg-emerald-100" },
    { label: "Ожидают", value: loading ? "—" : pendingCount, icon: <Banknote className="size-5 text-amber-600" />, bg: "bg-amber-100" },
    { label: "Выручка", value: loading ? "—" : `${totalRevenue.toLocaleString("ru-RU")} ₽`, icon: <TrendingUp className="size-5 text-blue-600" />, bg: "bg-blue-100" },
    { label: "Клиентов", value: loading ? "—" : uniqueCustomers, icon: <Users className="size-5 text-violet-600" />, bg: "bg-violet-100" },
  ];

  return (
    <main className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Долина молока" width={80} height={32} className="h-8 w-auto object-contain" />
            <Separator orientation="vertical" className="h-6 bg-border" />
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><ShieldCheck className="size-5 text-primary" />Панель администратора</h1>
              <p className="text-muted-foreground text-xs">Долина молока</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadOrders} disabled={refreshing} className="gap-2 border-border">
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />Обновить
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-border text-destructive hover:text-destructive">
              <LogOut className="size-4" />Выйти
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className={`size-9 rounded-lg ${stat.bg} flex items-center justify-center`}>{stat.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="mb-6 bg-background border border-border">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="size-4" />Заказы
              {pendingCount > 0 && <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{pendingCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><TrendingUp className="size-4" />Аналитика</TabsTrigger>
            <TabsTrigger value="customers" className="gap-2"><Users className="size-4" />Клиенты</TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2"><Tag className="size-4" />Акции</TabsTrigger>
            <TabsTrigger value="email" className="gap-2"><Mail className="size-4" />Email</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {loading ? <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div> : <OrdersTab orders={orders} onStatusChange={handleStatusChange} />}
          </TabsContent>
          <TabsContent value="analytics">
            {loading ? <div className="flex flex-col gap-3"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div> : <RevenueChart orders={orders} />}
          </TabsContent>
          <TabsContent value="customers">
            {loading ? <div className="flex flex-col gap-3">{[1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div> : <CustomersTab orders={orders} />}
          </TabsContent>
          <TabsContent value="promotions"><PromotionsTab /></TabsContent>
          <TabsContent value="email"><EmailTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import {
  ShieldCheck, PackageCheck, Banknote, ShoppingCart,
  Users, RefreshCw, Phone, Mail, MapPin, MessageSquare, LogOut,
  Search, TrendingUp, Package, User, ChevronDown, ChevronUp,
  Plus, Pencil, Trash2, Eye, EyeOff, Calendar,
  FileText, Upload, Download, Award, Shield, FileCheck, X, ImageIcon, ToggleLeft, ToggleRight,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import Image from "next/image";

type DbOrder = {
  id: string;
  order_number: string | null;
  total_amount: number;
  payment_status: string;
  delivery_status: string;
  comment: string | null;
  created_at: string;
  payment_expires_at: string | null;
  customer_id: string | null;
  customers: { id: string; full_name: string; phone: string; email: string | null; pickup_address: string | null } | null;
  order_items: { id: string; product_name: string; quantity: number; price: number }[];
};

// Таймер обратного отсчёта для заказов ожидающих оплаты
function PaymentCountdown({ expiresAt }: { expiresAt: string }) {
  const [ms, setMs] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()));
  useEffect(() => {
    if (ms <= 0) return;
    const t = setTimeout(() => setMs((m) => Math.max(0, m - 1000)), 1000);
    return () => clearTimeout(t);
  }, [ms]);
  if (ms <= 0) return <span className="text-[10px] text-destructive font-medium">Истёк</span>;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const color = ms > 180000 ? "text-emerald-600" : ms > 60000 ? "text-amber-600" : "text-destructive";
  return (
    <span className={`font-mono text-[10px] tabular-nums ${color}`}>
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Ожидает",
  paid: "Оплачен",
  fiscalization_pending: "Фискализация...",
  fiscalized: "Чек отправлен",
  fiscalization_failed: "Ошибка чека",
  cancelled: "Отменён",
};
const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fiscalization_pending: "bg-blue-50 text-blue-700 border-blue-200",
  fiscalized: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fiscalization_failed: "bg-red-50 text-red-700 border-red-200",
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
  const paid = orders.filter((o) => o.payment_status === "paid" || o.payment_status === "fiscalized");
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

function CustomersTab({ orders, onRefresh }: { orders: DbOrder[]; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const customerMap: Record<string, { id: string | null; phone: string; name: string; email: string | null; address: string | null; orders: DbOrder[] }> = {};
  orders.forEach((o) => {
    const phone = o.customers?.phone ?? "unknown";
    if (!customerMap[phone]) customerMap[phone] = { id: o.customers?.id ?? null, phone, name: o.customers?.full_name ?? "—", email: o.customers?.email ?? null, address: o.customers?.pickup_address ?? null, orders: [] };
    customerMap[phone].orders.push(o);
  });
  const customers = Object.values(customerMap)
    .sort((a, b) => b.orders.length - a.orders.length)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const handleDeleteCustomer = async (customerId: string | null, name: string) => {
    if (!customerId) return;
    if (!confirm(`Удалить клиента "${name}" и все его заказы? Это действие нельзя отменить.`)) return;
    const res = await fetch(`/api/admin/customers/${customerId}`, { method: "DELETE" });
    if (res.ok) {
      setExpanded(null);
      onRefresh();
    } else {
      alert("Не удалось удалить клиента");
    }
  };

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
                const spent = c.orders.filter((o) => o.payment_status === "paid" || o.payment_status === "fiscalized").reduce((s, o) => s + o.total_amount, 0);
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
                          {c.id && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id, c.name); }}
                                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="size-3" />
                                Удалить клиента и все его заказы
                              </button>
                            </div>
                          )}
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

function OrdersTab({ orders, onStatusChange, onDeleteOrder }: { orders: DbOrder[]; onStatusChange: (num: string, field: "paymentStatus" | "deliveryStatus", value: string) => void; onDeleteOrder: (id: string, orderNumber: string) => void }) {
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
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id} className="border-border hover:bg-secondary/40 transition-colors">
                      <TableCell>
                        {order.order_number ? (
                          <span className="font-mono text-xs font-semibold text-foreground bg-secondary px-2 py-1 rounded-lg">{order.order_number}</span>
                        ) : order.payment_status === "pending" && order.payment_expires_at ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-amber-600 font-medium">Ожидает оплаты</span>
                            <PaymentCountdown expiresAt={order.payment_expires_at} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Без номера</span>
                        )}
                      </TableCell>
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
                      <TableCell className="text-right">
                        <span className="font-bold text-foreground text-sm whitespace-nowrap">{order.total_amount.toLocaleString("ru-RU")} ₽</span>
                        <span className="block text-[10px] text-muted-foreground whitespace-nowrap">
                          В т.ч. НДС 10%: {(order.total_amount * 10 / 110).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select value={order.payment_status} onValueChange={(v) => onStatusChange(order.order_number, "paymentStatus", v)}>
                          <SelectTrigger className={`w-36 h-7 text-xs border rounded-full px-2 ${PAYMENT_COLORS[order.payment_status] ?? "bg-secondary text-muted-foreground border-border"}`}><SelectValue /></SelectTrigger>
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
                      <TableCell>
                        <button
                          onClick={() => onDeleteOrder(order.id, order.order_number)}
                          className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors"
                          title="Удалить заказ"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
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
  );
}

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  full_description: string;
  price: number;
  image_url: string;
  volume: string;
  composition: string;
  storage_conditions: string;
  category: string;
  in_stock: boolean;
  created_at: string;
};

const EMPTY_PRODUCT: Omit<AdminProduct, "id" | "slug" | "created_at"> = {
  name: "", description: "", full_description: "", price: 0,
  image_url: "", volume: "", composition: "", storage_conditions: "",
  category: "", in_stock: true,
};

const CATEGORIES = ["Молоко", "Кефир", "Йогурт", "Творог", "Сметана", "Масло", "Сыр", "Другое"];

function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Omit<AdminProduct, "id" | "slug" | "created_at"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm({ ...form, image_url: data.url });
    setUploading(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY_PRODUCT }); };
  const openEdit = (p: AdminProduct) => { setEditId(p.id); setForm({ name: p.name, description: p.description, full_description: p.full_description, price: p.price, image_url: p.image_url, volume: p.volume, composition: p.composition, storage_conditions: p.storage_conditions, category: p.category, in_stock: p.in_stock }); };
  const closeForm = () => { setForm(null); setEditId(null); };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/admin/products", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { closeForm(); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить товар?")) return;
    setDeleting(id);
    await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleting(null);
    load();
  };

  const handleToggleStock = async (p: AdminProduct) => {
    await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, in_stock: !p.in_stock }) });
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Поиск товара..." className="pl-9 border-border" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="gap-2 shrink-0"><Plus className="size-4" />Добавить товар</Button>
      </div>

      {/* Form */}
      {form && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editId ? "Редактировать товар" : "Новый товар"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={closeForm}><X className="size-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Название *</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Творог 9%" className="border-border" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Категория *</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="border-border"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Цена (₽) *</label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="border-border" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Объём / вес</label>
                <Input value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} placeholder="400 г" className="border-border" />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Фото товара</label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="URL или загрузите файл →" className="border-border" />
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button type="button" variant="outline" size="sm" className="border-border gap-2 self-start" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <RefreshCw className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                      {uploading ? "Загружаем..." : "Загрузить фото"}
                    </Button>
                  </div>
                  {form.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image_url} alt="" className="size-16 rounded-xl object-cover border border-border shrink-0" />
                  ) : (
                    <div className="size-16 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Краткое описание</label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Фермерский творог 9%..." className="border-border" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Состав</label>
                <Input value={form.composition} onChange={e => setForm({ ...form, composition: e.target.value })} placeholder="Молоко нормализованное, закваска..." className="border-border" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Условия хранения</label>
                <Input value={form.storage_conditions} onChange={e => setForm({ ...form, storage_conditions: e.target.value })} placeholder="+2...+6°C, 10 суток" className="border-border" />
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <label className="text-xs text-muted-foreground">В наличии</label>
                <button type="button" onClick={() => setForm({ ...form, in_stock: !form.in_stock })} className="focus:outline-none">
                  {form.in_stock
                    ? <ToggleRight className="size-7 text-primary" />
                    : <ToggleLeft className="size-7 text-muted-foreground" />}
                </button>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Полное описание</label>
                <Textarea value={form.full_description} onChange={e => setForm({ ...form, full_description: e.target.value })} placeholder="Подробное описание товара..." className="border-border min-h-[80px]" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.category || form.price <= 0} className="gap-2">
                {saving ? <RefreshCw className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
                {editId ? "Сохранить" : "Создать товар"}
              </Button>
              <Button variant="outline" onClick={closeForm} className="border-border">Отмена</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col gap-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="size-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Товары не найдены</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Объём</TableHead>
                <TableHead>Наличие</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className="hover:bg-secondary/30">
                  <TableCell>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="size-9 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="size-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                        <ImageIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{p.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{p.category}</Badge></TableCell>
                  <TableCell className="text-sm font-semibold">{p.price.toLocaleString("ru-RU")} ₽</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.volume || "—"}</TableCell>
                  <TableCell>
                    <button onClick={() => handleToggleStock(p)} className="focus:outline-none" title={p.in_stock ? "В наличии" : "Нет в наличии"}>
                      {p.in_stock
                        ? <ToggleRight className="size-6 text-primary" />
                        : <ToggleLeft className="size-6 text-muted-foreground" />}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="size-8 hover:bg-secondary">
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="size-8 hover:bg-red-50 hover:text-red-600">
                        {deleting === p.id ? <RefreshCw className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Всего товаров: {products.length}</p>
    </div>
  );
}

const TAX_SYSTEMS_OPTIONS = [
  { value: "1", label: "ОСН (общая)" },
  { value: "2", label: "УСН доход" },
  { value: "3", label: "УСН доход-расход" },
  { value: "4", label: "ЕСХН" },
  { value: "5", label: "ЕНВД" },
  { value: "6", label: "ПСН" },
];
// Коды ставок НДС Nanokassa (stavka_nds): 1—20%, 2—10%, 3—20/120, 4—10/110, 5—0%, 6—без НДС
const VAT_RATE_OPTIONS = [
  { value: "2", label: "НДС 10%" },
  { value: "1", label: "НДС 20%" },
  { value: "5", label: "НДС 0%" },
  { value: "6", label: "Без НДС" },
  { value: "4", label: "НДС 10/110" },
  { value: "3", label: "НДС 20/120" },
];
const PAYMENT_SUBJECT_OPTIONS = [
  { value: "1", label: "Товар" },
  { value: "4", label: "Услуга" },
  { value: "5", label: "Работа" },
];
const PAYMENT_METHOD_OPTIONS = [
  { value: "4", label: "Полная оплата" },
  { value: "1", label: "Предоплата 100%" },
  { value: "3", label: "Аванс" },
  { value: "7", label: "Полный расчёт" },
];

function ShopTab() {
  const [minOrder, setMinOrder] = useState("500");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.settings?.min_order_amount) {
          setMinOrder(data.settings.min_order_amount);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_order_amount: minOrder }),
      });
      const data = await res.json();
      setResult(data.ok
        ? { ok: true, msg: "Минимальная сумма заказ�� сохранена." }
        : { ok: false, msg: `Ошибка: ${data.error}` }
      );
    } catch {
      setResult({ ok: false, msg: "Ошибка соединения" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />Настройки магазина
          </CardTitle>
          <CardDescription>
            Минимальная сумма заказа — покупатель не сможет оформить заказ на меньшую сумму.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Минимальная сумма заказа (₽)</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="500"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="border-border w-36"
                  />
                  <span className="text-sm text-muted-foreground">₽</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Установите 0 чтобы отключить ограничение.
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="self-start gap-2">
                {saving ? <RefreshCw className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
              {result && (
                <p className={`text-sm px-3 py-2 rounded-lg border ${result.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {result.msg}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmailTab() {
  const [smtp, setSmtp] = useState({ host: "smtp.mail.ru", port: "465", user: "", pass: "", to: "" });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load saved settings from DB on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.settings) {
          const s = data.settings;
          setSmtp({
            host: s.smtp_host ?? "smtp.mail.ru",
            port: s.smtp_port ?? "465",
            user: s.smtp_user ?? "",
            pass: s.smtp_pass ?? "",
            to:   s.smtp_to   ?? "",
          });
        }
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleTest = async () => {
    setTesting(true); setResult(null); setSaved(false);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtp),
      });
      const data = await res.json();
      if (data.ok) {
        setResult("Письмо отправлено успешно. Настройки сохранены.");
        setSaved(true);
      } else {
        setResult(`Ошибка: ${data.error}`);
      }
    } catch {
      setResult("Ошибка соединения");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="size-4 text-primary" />SMTP настройки
          </CardTitle>
          <CardDescription>
            Настройки хра������ятся в базе данных. Нажмите "О��править тест" — если всё верно, письмо уйдёт и настройки сохранятся автоматически.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loadingSettings ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">SMTP хост</label>
                  <Input placeholder="smtp.mail.ru" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} className="border-border" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted-foreground mb-1 block">Порт</label>
                  <Input placeholder="465" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} className="border-border" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email отправителя</label>
                <Input placeholder="inevolin228@mail.ru" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} className="border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Пароль / App Password</label>
                <Input type="password" placeholder="••••••••" value={smtp.pass} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} className="border-border" />
                <p className="text-xs text-muted-foreground mt-1">
                  Для mail.ru: включите {"«"}Пароли для внешних приложений{"»"} в настройках почты и вставьте сгенерированный пароль.
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Получатель уве��ом��ений о заказах</label>
                <Input placeholder="inevolin228@mail.ru" value={smtp.to} onChange={(e) => setSmtp({ ...smtp, to: e.target.value })} className="border-border" />
              </div>
              <Separator className="bg-border" />
              <Button
                onClick={handleTest}
                disabled={testing || !smtp.host || !smtp.user || !smtp.pass}
                variant="outline"
                className="border-border gap-2 self-start"
              >
                {testing ? <RefreshCw className="size-4 animate-spin" /> : <Mail className="size-4" />}
                {testing ? "Проверяем..." : "Отправить тест и сохранить"}
              </Button>
              {saved && (
                <p className="text-xs text-muted-foreground">Настройки сохранены в базе данных. Все новые заказы будут уведомлять на {smtp.to || smtp.user}.</p>
              )}
              {result && (
                <p className={`text-sm px-3 py-2 rounded-lg border ${result.startsWith("Ошибка") ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{result}</p>
              )}
            </>
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
            <div className="py-16 text-center text-muted-foreground text-sm">Акций пока нет. Д��бавьте первую.</div>
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

const DOC_CATEGORY_OPTIONS = [
  { value: "certificate", label: "Сертификат", icon: <Award className="size-4 text-amber-600" /> },
  { value: "declaration", label: "Декларация", icon: <FileCheck className="size-4 text-sky-600" /> },
  { value: "license", label: "Лицензия", icon: <Shield className="size-4 text-blue-600" /> },
  { value: "quality", label: "Качество", icon: <FileCheck className="size-4 text-emerald-600" /> },
  { value: "other", label: "Прочее", icon: <FileText className="size-4 text-muted-foreground" /> },
];

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  is_public: boolean;
  created_at: string;
};

function DocumentsTab() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "certificate", is_public: true });
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/documents");
      const json = await res.json();
      setDocuments(json.documents ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async () => {
    if (!file || !form.title) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("is_public", String(form.is_public));
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        console.error("[admin] upload error", json);
        alert(`Ошибка загрузки: ${json.error ?? res.status}`);
        return;
      }
      setFile(null);
      setForm({ title: "", description: "", category: "certificate", is_public: true });
      setShowForm(false);
      load();
    } catch (err) {
      console.error("[admin] upload exception", err);
      alert("Не удалось загрузить файл. Проверьте консоль.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить документ?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{documents.length} файлов загружено</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Upload className="size-4" />Загруз��ть файл
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Новый документ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Название *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Сертификат соответствия ГОСТ" className="border-border" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Краткое описание документа..." className="border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Категория</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                  {DOC_CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Файл *</label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full h-9 text-sm file:mr-3 file:h-full file:border-0 file:bg-secondary file:text-foreground file:text-xs file:font-medium file:rounded-md file:px-3 cursor-pointer"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} className="accent-primary" />
              Показывать на сайте в разделе Документы
            </label>
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button onClick={handleUpload} disabled={uploading || !file || !form.title} size="sm" className="gap-2">
                {uploading ? <RefreshCw className="size-3 animate-spin" /> : <Upload className="size-3" />}
                {uploading ? "Загрузка..." : "Загрузить"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="border-border">Отмена</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <FileText className="size-8 opacity-30" />
              Д����кументы не загружены. Нажмите "Загрузить файл".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-secondary/60">
                  <TableHead className="font-semibold">Документ</TableHead>
                  <TableHead className="font-semibold">Категория</TableHead>
                  <TableHead className="font-semibold">Размер</TableHead>
                  <TableHead className="font-semibold">Видимость</TableHead>
                  <TableHead className="font-semibold">Дата</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const catOption = DOC_CATEGORY_OPTIONS.find((o) => o.value === doc.category);
                  const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.file_name);
                  return (
                    <TableRow key={doc.id} className="border-border hover:bg-secondary/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {isImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={doc.file_url} alt={doc.title} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{doc.title}</p>
                            {doc.description && <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {catOption?.icon}
                          {catOption?.label ?? doc.category}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatSize(doc.file_size)}</TableCell>
                      <TableCell>
                        {doc.is_public
                          ? <span className="text-xs text-emerald-600 flex items-center gap-1"><Eye className="size-3" />Публично</span>
                          : <span className="text-xs text-muted-foreground flex items-center gap-1"><EyeOff className="size-3" />Скрыто</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="size-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Открыть">
                            <Download className="size-3.5" />
                          </a>
                          <button onClick={() => handleDelete(doc.id)} className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors" title="Удалить">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
      // Сначала отменяем все просроченные pending-заказы, потом читаем актуальное состояние
      await fetch("/api/payment/cleanup", { method: "POST" }).catch(() => {});
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

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (!confirm(`Удалить заказ ${orderNumber}? Это действие нельзя отменить.`)) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    if (res.ok) loadOrders();
    else alert("Не удалось удалить заказ");
  };

  const handleLogout = async () => { await createClient().auth.signOut(); router.push("/admin/login"); };

  if (!authChecked) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <RefreshCw className="size-6 animate-spin" /><span className="text-sm">Загрузка...</span>
      </div>
    </div>
  );

  const totalRevenue = orders.filter((o) => o.payment_status === "paid" || o.payment_status === "fiscalized").reduce((s, o) => s + o.total_amount, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customers?.phone)).size;
  // Только реально ожидающие оплаты (с действующим таймером, не просроченные)
  const pendingCount = orders.filter((o) =>
    o.payment_status === "pending" &&
    o.payment_expires_at &&
    new Date(o.payment_expires_at).getTime() > Date.now()
  ).length;

  const stats = [
    { label: "Заказов", value: loading ? "—" : orders.length, icon: <ShoppingCart className="size-5 text-primary" />, bg: "bg-primary/10" },
    { label: "Оплачено", value: loading ? "—" : orders.filter((o) => o.payment_status === "paid" || o.payment_status === "fiscalized").length, icon: <PackageCheck className="size-5 text-emerald-600" />, bg: "bg-emerald-100" },
    { label: "Ожидают", value: loading ? "—" : pendingCount, icon: <Banknote className="size-5 text-amber-600" />, bg: "bg-amber-100" },
    { label: "Выручка", value: loading ? "��" : `${totalRevenue.toLocaleString("ru-RU")} ₽`, icon: <TrendingUp className="size-5 text-blue-600" />, bg: "bg-blue-100" },
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
                  {stat.label === "Выручка" && totalRevenue > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      В т.ч. НДС 10%: {(totalRevenue * 10 / 110).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽
                    </p>
                  )}
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
            <TabsTrigger value="products" className="gap-2"><Package className="size-4" />Товары</TabsTrigger>
            <TabsTrigger value="documents" className="gap-2"><FileText className="size-4" />Документы</TabsTrigger>
            <TabsTrigger value="shop" className="gap-2"><ShoppingCart className="size-4" />Магазин</TabsTrigger>
                <TabsTrigger value="email" className="gap-2"><Mail className="size-4" />Email</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {loading ? <div className="flex flex-col gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div> : <OrdersTab orders={orders} onStatusChange={handleStatusChange} onDeleteOrder={handleDeleteOrder} />}
          </TabsContent>
          <TabsContent value="analytics">
            {loading ? <div className="flex flex-col gap-3"><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div> : <RevenueChart orders={orders} />}
          </TabsContent>
          <TabsContent value="customers">
            {loading ? <div className="flex flex-col gap-3">{[1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div> : <CustomersTab orders={orders} onRefresh={loadOrders} />}
          </TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="documents"><DocumentsTab /></TabsContent>
          <TabsContent value="shop"><ShopTab /></TabsContent>
              <TabsContent value="email"><EmailTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

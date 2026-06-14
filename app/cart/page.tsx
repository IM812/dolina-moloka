"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import { usePromotions, getBestDiscount } from "@/hooks/use-promotions";
import { toast } from "sonner";
import { Tag } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const { promotions } = usePromotions();
  const total = getTotal();
  const { promotion, discountAmount, finalTotal } = getBestDiscount(promotions, total);
  const MIN_ORDER = 600;
  const belowMin = finalTotal < MIN_ORDER;

  const handleRemove = (name: string, id: string) => {
    removeItem(id);
    toast.success(`${name} удалён из корзины`);
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
            <p className="text-muted-foreground">Добавьте продукты из каталога</p>
          </div>
          <Link href="/catalog">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <ArrowRight className="size-4" data-icon="inline-start" />
              Перейти в каталог
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-5 max-w-7xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Корзина</h1>
          <button
            onClick={() => { clearCart(); toast.success("Корзина очищена"); }}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="size-4" />
            Очистить
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card border border-border rounded-2xl p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4"
                >
                  {/* Image */}
                  <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                    <div className="size-16 sm:size-20 bg-secondary rounded-xl overflow-hidden relative">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.product.weight}</p>
                    <p className="font-bold text-foreground mt-1.5 text-sm">
                      {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </p>
                    {/* Quantity controls — inside info on mobile */}
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      <button
                        onClick={() =>
                          item.quantity === 1
                            ? handleRemove(item.product.name, item.product.id)
                            : updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        aria-label="Уменьшить"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                        aria-label="Увеличить"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity — desktop only */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? handleRemove(item.product.name, item.product.id)
                          : updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="size-8 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-accent transition-colors"
                      aria-label="Уменьшить"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                      aria-label="Увеличить"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleRemove(item.product.name, item.product.id)}
                    className="size-7 sm:size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors flex-shrink-0 self-start sm:self-auto"
                    aria-label="Удалить"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4 sm:p-6 sm:sticky sm:top-24"
            >
              <h2 className="font-semibold text-foreground text-lg mb-5">Итого</h2>

              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate flex-1 mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-foreground font-medium flex-shrink-0">
                      {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                ))}
              </div>

              {promotion && discountAmount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2 mb-4">
                  <Tag className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 leading-tight">{promotion.title}</p>
                    {promotion.badge_text && (
                      <p className="text-xs text-emerald-600 mt-0.5">{promotion.badge_text}</p>
                    )}
                  </div>
                  <span className="text-emerald-700 font-bold text-sm shrink-0">
                    −{discountAmount.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              )}

              <Separator className="bg-border mb-4" />

              {discountAmount > 0 && (
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Сумма товаров</span>
                  <span className="text-muted-foreground line-through">
                    {total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-foreground text-lg">
                  {discountAmount > 0 ? "Итого со скидкой" : "Сумма"}
                </span>
                <span className="font-bold text-foreground text-xl">
                  {finalTotal.toLocaleString("ru-RU")} ₽
                </span>
              </div>

              {belowMin && (
                <div className="bg-destructive/10 border border-destructive/25 rounded-xl px-4 py-3 text-sm text-destructive leading-snug mb-4">
                  Минимальный заказ — <span className="font-bold">600 ₽</span>. Добавьте ещё товаров на{" "}
                  <span className="font-bold">{MIN_ORDER - finalTotal} ₽</span>.
                </div>
              )}

              <Link href={belowMin ? "#" : "/checkout"} className="block" aria-disabled={belowMin} tabIndex={belowMin ? -1 : 0}>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  size="lg"
                  disabled={belowMin}
                >
                  Оформить заказ
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
              </Link>

              <Link href="/catalog" className="block mt-3">
                <Button variant="outline" className="w-full border-border" size="sm">
                  Продолжить покупки
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

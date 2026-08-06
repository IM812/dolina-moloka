"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/product-card";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types";
import { toast } from "sonner";

interface Props {
  product: Product;
  related: Product[];
}

export function ProductDetailClient({ product, related }: Props) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-5 max-w-7xl">
        {/* Back button + breadcrumb row */}
        <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10">
          {/* Раньше <motion.button> лежала внутри <Link>: <button> внутри <a> —
              невалидная вложенность, и Safari на iOS не переходит по такой ссылке.
              Теперь анимируется обёртка, а кликается сама ссылка. */}
          <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Назад</span>
              <span className="sr-only sm:hidden">Назад в каталог</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors whitespace-nowrap">Главная</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-foreground transition-colors whitespace-nowrap">Каталог</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-12 sm:mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-border shadow-sm">
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-12"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <div>
              <Badge variant="secondary" className="text-muted-foreground mb-3">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
                {product.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.fullDescription}
              </p>
            </div>

            <Separator className="bg-border" />

            {/* Price & Weight */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{product.price} ₽</p>
                <p className="text-sm text-muted-foreground mt-1">{product.weight}</p>
              </div>
              <Badge className={product.inStock ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-destructive/10 text-destructive"}>
                {product.inStock ? (
                  <><Check className="size-3 mr-1" />В наличии</>
                ) : "Нет в наличии"}
              </Badge>
            </div>

            {/* Add to cart */}
            {quantity === 0 ? (
              <Button
                onClick={handleAdd}
                size="lg"
                disabled={!product.inStock}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full"
              >
                <ShoppingCart className="size-5" data-icon="inline-start" />
                В корзину
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-secondary border border-border rounded-xl p-1">
                  <button
                    onClick={() =>
                      quantity === 1
                        ? removeItem(product.id)
                        : updateQuantity(product.id, quantity - 1)
                    }
                    className="size-10 rounded-lg bg-background flex items-center justify-center hover:bg-accent transition-colors"
                    aria-label="Уменьшить"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    aria-label="Увеличить"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <Button
                  render={<Link href="/cart" />}
                  variant="outline"
                  className="flex-1 border-border gap-2"
                >
                  <ShoppingCart className="size-4" data-icon="inline-start" />
                  Перейти в корзину
                </Button>
              </div>
            )}

            <Separator className="bg-border" />

            {/* Details */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">Состав</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.composition}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">Условия хранения</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.storageConditions}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Другие продукты</h2>
              <Button
                render={<Link href="/catalog" />}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary"
              >
                <ArrowLeft className="size-4 rotate-180" data-icon="inline-start" />
                Весь каталог
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

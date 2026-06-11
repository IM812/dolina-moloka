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
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-foreground transition-colors">Каталог</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square bg-secondary rounded-3xl overflow-hidden border border-border">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-contain p-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
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
                <Link href="/cart" className="flex-1">
                  <Button variant="outline" className="w-full border-border gap-2">
                    <ShoppingCart className="size-4" data-icon="inline-start" />
                    Перейти в корзину
                  </Button>
                </Link>
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
              <Link href="/catalog">
                <Button variant="ghost" size="sm" className="gap-1.5 text-primary">
                  <ArrowLeft className="size-4 rotate-180" data-icon="inline-start" />
                  Весь каталог
                </Button>
              </Link>
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

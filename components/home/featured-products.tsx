"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { products } from "@/lib/mock-data";
import { toast } from "sonner";
import { Product } from "@/types";

function PremiumProductCard({ product, index }: { product: Product; index: number }) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:border-transparent transition-all duration-500 hover:-translate-y-2 flex flex-col"
    >
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative bg-secondary h-56 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5">{product.category}</p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-heading font-semibold text-foreground text-lg leading-snug hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="font-heading text-2xl font-bold text-foreground">{product.price} <span className="text-base font-normal text-muted-foreground">₽</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">{product.weight}</p>
          </div>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/80 active:scale-95 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
            >
              <ShoppingCart className="size-4" />
              В корзину
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-secondary rounded-2xl p-1">
              <button
                onClick={() => quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
                className="size-8 rounded-xl bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-all active:scale-90"
                aria-label="Уменьшить"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-7 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="size-8 rounded-xl bg-foreground text-background hover:bg-foreground/80 flex items-center justify-center transition-all active:scale-90"
                aria-label="Увеличить"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedProducts() {
  const featured = products.slice(0, 4);

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-4">
            Популярное
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
            Любимые продукты
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((product, i) => (
            <PremiumProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

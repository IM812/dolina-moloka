"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { products } from "@/lib/mock-data";
import { toast } from "sonner";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";

function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/20 transition-shadow duration-300 flex flex-col h-full">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
        <div className="relative bg-white h-36 sm:h-40 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-medium text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-2 min-h-[40px]">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">{product.weight}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <p className="font-bold text-foreground text-lg">
            {product.price} <span className="text-sm font-normal text-muted-foreground">₽</span>
          </p>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/80 active:scale-95 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            >
              <ShoppingCart className="size-3.5" />
              В корзину
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-secondary rounded-xl p-1">
              <button
                onClick={() => quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
                className="size-7 rounded-lg bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-all active:scale-90"
                aria-label="Уменьшить"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="size-7 rounded-lg bg-foreground text-background hover:bg-foreground/80 flex items-center justify-center transition-all active:scale-90"
                aria-label="Увеличить"
              >
                <Plus className="size-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedProducts() {
  return (
    <section className="py-10 sm:py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium block mb-3">
              Ассортимент
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Наша продукция
            </h2>
          </div>
          <Link href="/catalog">
            <Button variant="outline" className="gap-2 border-border">
              Весь каталог
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

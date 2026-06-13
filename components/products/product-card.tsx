"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:shadow-black/5 hover:border-primary/25 transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
        <div className="relative bg-white h-44 sm:h-48 overflow-hidden rounded-t-2xl">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80 mb-1.5 block">
            {product.category}
          </span>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div>
            <p className="text-lg font-bold text-foreground leading-none">
              {product.price} <span className="text-sm font-medium text-muted-foreground">₽</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{product.weight}</p>
          </div>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/80 active:scale-95 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">В корзину</span>
              <span className="sm:hidden">+</span>
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
              <span className="w-6 text-center font-bold text-sm">{quantity}</span>
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

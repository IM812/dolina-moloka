"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
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
    <motion.div
      className={cn(
        "group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <div className="relative h-52 bg-secondary flex items-center justify-center overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <Badge variant="secondary" className="text-xs mb-2 text-muted-foreground">
            {product.category}
          </Badge>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-foreground text-base leading-snug hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <div>
            <p className="text-xl font-bold text-foreground">{product.price} ₽</p>
            <p className="text-xs text-muted-foreground">{product.weight}</p>
          </div>

          {quantity === 0 ? (
            <Button
              onClick={handleAdd}
              size="sm"
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCart className="size-4" data-icon="inline-start" />
              В корзину
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  quantity === 1
                    ? removeItem(product.id)
                    : updateQuantity(product.id, quantity - 1)
                }
                className="size-8 rounded-lg bg-accent hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors"
                aria-label="Уменьшить"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="size-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors"
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

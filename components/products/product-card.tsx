"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={cn(
        "group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:shadow-black/5 hover:border-primary/25 transition-shadow duration-300",
        className
      )}
    >
      {/* Image zone — white bg, generous padding, contained */}
      <Link href={`/product/${product.slug}`} className="block flex-shrink-0">
        <div className="relative bg-white h-52 sm:h-56 overflow-hidden rounded-t-2xl">
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.35 }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-6"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </motion.div>
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
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.93 }}
              className="flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/80 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200"
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">В корзину</span>
              <span className="sm:hidden">+</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-1.5 bg-secondary rounded-xl p-1">
              <motion.button
                onClick={() => quantity === 1 ? removeItem(product.id) : updateQuantity(product.id, quantity - 1)}
                whileTap={{ scale: 0.88 }}
                className="size-7 rounded-lg bg-card border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
                aria-label="Уменьшить"
              >
                <Minus className="size-3" />
              </motion.button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.18 }}
                className="w-6 text-center font-bold text-sm"
              >
                {quantity}
              </motion.span>
              <motion.button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                whileTap={{ scale: 0.88 }}
                className="size-7 rounded-lg bg-foreground text-background hover:bg-foreground/80 flex items-center justify-center transition-colors"
                aria-label="Увеличить"
              >
                <Plus className="size-3" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/products/product-card";
import { products } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = ["Все", ...Array.from(new Set(products.map((p) => p.category)))];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "Все" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
            Каталог продуктов
          </h1>
          <p className="text-muted-foreground text-lg">
            Натуральная молочная продукция без консервантов
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Поиск продуктов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 mb-6">
          <Badge variant="secondary" className="text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "продукт" : filtered.length < 5 ? "продукта" : "продуктов"}
          </Badge>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-lg">Продукты не найдены</p>
            <p className="text-muted-foreground text-sm mt-1">
              Попробуйте изменить фильтры поиска
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70svh] flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center">
        {/* Big 404 */}
        <div className="relative mb-6">
          <p className="text-[9rem] sm:text-[12rem] font-bold leading-none text-primary/10 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-20 sm:size-24 rounded-3xl bg-secondary border border-border flex items-center justify-center shadow-sm">
              <span className="text-4xl sm:text-5xl">🥛</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
          Страница не найдена
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-8 text-pretty">
          Возможно, адрес был введён с ошибкой или страница переехала. Загляните в каталог — там точно найдётся что-то вкусное.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto gap-2 border-border">
              <Home className="size-4" />
              На главную
            </Button>
          </Link>
          <Link href="/catalog">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <ShoppingBag className="size-4" />
              В каталог
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type NewsCardItem = {
  id: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  category: string | null;
  published_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NewsCard({
  item,
  className,
  priority,
}: {
  item: NewsCardItem;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/news/${item.id}`}
      className={cn(
        "group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:shadow-black/5 hover:border-primary/25 transition-all duration-300",
        className
      )}
    >
      <div className="relative bg-secondary h-44 sm:h-48 overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Ферма
          </div>
        )}
        {item.category && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-[0.14em] bg-background/90 text-foreground px-2.5 py-1 rounded-full">
            {item.category}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
        </div>
        <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {item.excerpt}
        </p>
      </div>
    </Link>
  );
}

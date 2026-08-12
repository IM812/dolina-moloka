"use client";

import useSWR from "swr";

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  show_on_homepage: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNews(options?: { homepageOnly?: boolean; category?: string }) {
  const params = new URLSearchParams();
  if (options?.homepageOnly) params.set("homepage", "1");
  if (options?.category) params.set("category", options.category);
  const query = params.toString();

  const { data, error, isLoading } = useSWR<{ news: NewsItem[] }>(
    `/api/news${query ? `?${query}` : ""}`,
    fetcher
  );

  return {
    news: data?.news ?? [],
    loading: isLoading,
    error,
  };
}

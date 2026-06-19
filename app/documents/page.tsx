"use client";

import useSWR from "swr";
import { FileText, Download, FileCheck, Shield, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Document = {
  id: string;
  title: string;
  description: string | null;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  certificate: "Сертификаты",
  license: "Лицензии",
  quality: "Качество",
  other: "Прочее",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  certificate: <Award className="size-5 text-amber-600" />,
  license: <Shield className="size-5 text-blue-600" />,
  quality: <FileCheck className="size-5 text-emerald-600" />,
  other: <FileText className="size-5 text-muted-foreground" />,
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function isImage(fileName: string) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
}

export default function DocumentsPage() {
  const { data, isLoading } = useSWR<{ documents: Document[] }>("/api/documents", fetcher);
  const documents = data?.documents ?? [];

  // Group by category
  const grouped = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    const cat = doc.document_type || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileCheck className="size-4" />
            Прозрачность производства
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
            Документы и сертификаты
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Вся необходимая документация подтверждающая качество и безопасность нашей продукции.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-8">
            {[1, 2].map((g) => (
              <div key={g}>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="size-12 mx-auto mb-4 opacity-30" />
            <p>Документы пока не добавлены</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(grouped).map(([cat, docs]) => (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-4">
                  {CATEGORY_ICONS[cat] ?? CATEGORY_ICONS.other}
                  <h2 className="text-lg font-semibold text-foreground">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h2>
                  <Badge variant="secondary" className="ml-1">{docs.length}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {docs.map((doc) => {
                    const serveUrl = `/api/documents/${doc.id}`;
                    return (
                    <Card key={doc.id} className="border-border hover:border-primary/40 transition-colors group overflow-hidden">
                      {isImage(doc.file_name) ? (
                        /* Image document — full-width photo + meta below */
                        <div>
                          <a href={serveUrl} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={serveUrl}
                              alt={doc.title}
                              className="w-full max-h-72 object-contain bg-secondary border-b border-border"
                            />
                          </a>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-foreground leading-tight">{doc.title}</p>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5">
                                  {formatSize(doc.file_size) && (
                                    <span className="text-xs text-muted-foreground">{formatSize(doc.file_size)}</span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(doc.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
                                  </span>
                                </div>
                              </div>
                              <a
                                href={serveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={doc.file_name}
                                className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors shrink-0"
                                aria-label={`Скачать ${doc.title}`}
                              >
                                <Download className="size-4" />
                              </a>
                            </div>
                          </CardContent>
                        </div>
                      ) : (
                        /* Non-image document — compact row */
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="size-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                              <FileText className="size-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{doc.title}</p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {formatSize(doc.file_size) && (
                                  <span className="text-xs text-muted-foreground">{formatSize(doc.file_size)}</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
                                </span>
                              </div>
                            </div>
                            <a
                              href={serveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={doc.file_name}
                              className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors flex-shrink-0 mt-0.5"
                              aria-label={`Скачать ${doc.title}`}
                            >
                              <Download className="size-4" />
                            </a>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

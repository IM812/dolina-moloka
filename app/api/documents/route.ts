import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

// GET — public list of documents (anon, RLS: is_public = true)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ documents: data ?? [] });
  } catch (err) {
    console.error("[documents GET]", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Только авторизованный администратор может загружать документы */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

// POST — upload file to Blob + save metadata (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") ?? "").trim().slice(0, 200);
    const rawDescription = String(formData.get("description") ?? "").trim();
    const description = rawDescription ? rawDescription.slice(0, 1000) : null;
    const category = String(formData.get("category") ?? "other").slice(0, 50);
    const is_public = formData.get("is_public") !== "false";

    if (!file || !title) {
      return NextResponse.json({ error: "file and title are required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 413 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Недопустимый тип файла" }, { status: 415 });
    }

    // Санитизируем имя файла — исключаем path traversal и спецсимволы
    const safeName = file.name.replace(/[^\w.\-]/g, "_").slice(-100);

    // Upload to Vercel Blob
    const blob = await put(`documents/${Date.now()}-${safeName}`, file, {
      access: "private",
    });

    // Save metadata with service role (bypasses RLS)
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title,
        description,
        category,
        file_url: blob.url,
        file_name: file.name,
        file_size: file.size,
        is_public,
      })
      .select()
      .single();

    if (error) {
      console.error("[documents POST] supabase insert error", error);
      throw error;
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    console.error("[documents POST]", err);
    return NextResponse.json({ error: "Не удалось загрузить документ" }, { status: 500 });
  }
}

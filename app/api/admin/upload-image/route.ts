import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    // Разрешаем только изображения
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Разрешены только изображения (jpg, png, webp, avif, gif)" }, { status: 400 });
    }

    // Ограничение размера — 10 МБ
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Файл слишком большой (максимум 10 МБ)" }, { status: 400 });
    }

    const SAFE_EXTS: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
    };
    const ext = SAFE_EXTS[file.type] ?? "jpg";
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[upload-image]", error);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}

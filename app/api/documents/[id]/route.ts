import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

// GET — serve a private blob file for public documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: doc, error } = await supabase
      .from("documents")
      .select("file_url, file_name, is_public")
      .eq("id", id)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!doc.is_public) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For public documents — fetch via server using blob token if available,
    // otherwise redirect directly to the blob URL (works on any host)
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (token) {
      const blobRes = await fetch(doc.file_url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (blobRes.ok) {
        const contentType = blobRes.headers.get("content-type") ?? "application/octet-stream";
        const ext = doc.file_name?.split(".").pop()?.toLowerCase() ?? "";
        const inline = ["jpg", "jpeg", "png", "gif", "webp", "pdf"].includes(ext);
        const encodedName = encodeURIComponent(doc.file_name ?? "file");
        const disposition = inline
          ? `inline; filename*=UTF-8''${encodedName}`
          : `attachment; filename*=UTF-8''${encodedName}`;

        return new NextResponse(blobRes.body, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": disposition,
            "Cache-Control": "private, max-age=3600",
          },
        });
      }
    }

    // Fallback: redirect directly to the blob URL
    return NextResponse.redirect(doc.file_url);
  } catch (err) {
    console.error("[documents GET]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

/** Только авторизованный администратор может изменять/удалять документы */
async function requireAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  return user ?? null;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (fetchError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(doc.file_url);
    } catch (blobErr) {
      console.error("[documents DELETE] blob delete failed (continuing)", blobErr);
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[documents DELETE]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Разрешаем обновлять только безопасные поля
    const allowed: Record<string, unknown> = {};
    for (const key of ["title", "description", "category", "is_public"]) {
      if (key in body) allowed[key] = body[key];
    }
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
    }

    const { error } = await supabase.from("documents").update(allowed).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[documents PATCH]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

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

    // Fetch private blob using the token for authorization
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    const blobRes = await fetch(doc.file_url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!blobRes.ok) {
      console.error("[documents GET] blob fetch failed", blobRes.status, doc.file_url);
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    const contentType = blobRes.headers.get("content-type") ?? "application/octet-stream";
    const ext = doc.file_name?.split(".").pop()?.toLowerCase() ?? "";
    // Images and PDFs open inline, everything else downloads
    const inline = ["jpg", "jpeg", "png", "gif", "webp", "pdf"].includes(ext);
    const disposition = inline
      ? `inline; filename="${doc.file_name}"`
      : `attachment; filename="${doc.file_name}"`;

    return new NextResponse(blobRes.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[documents GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    const { error } = await supabase.from("documents").update(body).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[documents PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

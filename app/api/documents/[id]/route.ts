import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get file URL first so we can delete from Blob
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

    // Delete from Supabase
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[documents DELETE]", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { error } = await supabase.from("documents").update(body).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[documents PATCH]", err);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

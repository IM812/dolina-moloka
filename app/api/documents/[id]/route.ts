import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

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

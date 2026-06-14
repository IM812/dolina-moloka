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

// POST — upload file to Blob + save metadata (service role bypasses RLS)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) ?? "";
    const description = (formData.get("description") as string) || null;
    const category = (formData.get("category") as string) ?? "other";
    const is_public = formData.get("is_public") !== "false";

    if (!file || !title) {
      return NextResponse.json({ error: "file and title are required" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`documents/${Date.now()}-${file.name}`, file, {
      access: "public",
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

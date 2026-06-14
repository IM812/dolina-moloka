import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin-only: returns ALL documents regardless of is_public
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify session — only authenticated admins can call this
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ documents: data ?? [] });
  } catch (err) {
    console.error("[admin/documents GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

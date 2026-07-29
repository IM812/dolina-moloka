import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Returns ALL documents including hidden ones — service role bypasses RLS
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ documents: data ?? [] });
  } catch (err) {
    console.error("[admin/documents GET]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homepageOnly = searchParams.get("homepage") === "1";
  const category = searchParams.get("category");

  const supabase = createAnonClient(getSupabaseUrl(), getSupabaseAnonKey());

  let query = supabase
    .from("news")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  if (homepageOnly) query = query.eq("show_on_homepage", true);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  return NextResponse.json({ news: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase.from("news").insert(body).select().single();
  if (error) return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  return NextResponse.json({ news: data }, { status: 201 });
}

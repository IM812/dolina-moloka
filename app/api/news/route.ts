import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const homepageOnly = searchParams.get("homepage") === "1";
  const category = searchParams.get("category");

  // Админка (авторизованный пользователь) должна видеть ВСЕ новости, включая
  // снятые с публикации (is_active: false) — иначе такие записи "пропадают"
  // без возможности снова включить их через интерфейс. Публичный сайт видит
  // только активные записи.
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const isAdmin = Boolean(user);

  const supabase = isAdmin ? authClient : createAnonClient(getSupabaseUrl(), getSupabaseAnonKey());

  let query = supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  if (!isAdmin) query = query.eq("is_active", true);
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

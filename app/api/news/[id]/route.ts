import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase.from("news").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  return NextResponse.json({ news: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

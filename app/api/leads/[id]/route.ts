import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: lead, error } = await db.from("leads").select("*").eq("id", id).single();
  if (error || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const { data: messages } = await db
    .from("chat_messages")
    .select("role,content")
    .eq("lead_id", id)
    .order("created_at", { ascending: true });
  return NextResponse.json({ lead, messages: messages ?? [] });
}
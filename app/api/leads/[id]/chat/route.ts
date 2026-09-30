import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { generateText, leadContext } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const { data: lead } = await db.from("leads").select("*").eq("id", id).single();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { data: history } = await db
    .from("chat_messages")
    .select("role,content")
    .eq("lead_id", id)
    .order("created_at", { ascending: true })
    .limit(20);

  const system = `You are a sales coach assistant for a real-estate salesperson in India.
Answer ONLY using this lead's data below. If something is not in the data, say so and suggest what to ask the customer.
Be concise and practical (max 120 words unless asked to write a message).

LEAD:
${leadContext(lead)}

AI ANALYSIS:
${JSON.stringify({ ...lead.analysis, brief: undefined })}`;

  const convo = (history ?? [])
    .map((m) => `${m.role === "user" ? "Salesperson" : "Assistant"}: ${m.content}`)
    .join("\n");

  try {
    const reply = await generateText(system, `${convo}\nSalesperson: ${message}\nAssistant:`);
    await db.from("chat_messages").insert({ lead_id: id, role: "user", content: message });
    await db.from("chat_messages").insert({ lead_id: id, role: "assistant", content: reply });
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "AI failed" }, { status: 502 });
  }
}
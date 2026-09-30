import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { analyzeLead } from "@/lib/ai";

export const maxDuration = 30;

export async function GET() {
  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("score", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.message) {
    return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
  }
  try {
    const analysis = await analyzeLead(body);
    const { data, error } = await db
      .from("leads")
      .insert({
        name: body.name,
        location: body.location,
        requirement: body.requirement,
        budget: body.budget,
        timeline: body.timeline,
        message: body.message,
        analysis,
        score: analysis.score,
        tier: analysis.tier,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "AI analysis failed" }, { status: 502 });
  }
}
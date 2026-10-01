import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/supabase";
import { generateJSON, leadContext } from "@/lib/ai";

export const maxDuration = 30;

const DebriefSchema = z.object({
  new_score: z.number().min(0).max(100),
  new_tier: z.enum(["hot", "warm", "cold"]),
  urgent: z.boolean(),
  what_changed: z.array(z.string()),
  resolved_objections: z.array(z.string()),
  objections: z.array(z.string()),
  next_action: z.string(),
  follow_up_message: z.string(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { notes } = await req.json();
  if (!notes || String(notes).trim().length < 5) {
    return NextResponse.json({ error: "Add a few call notes first" }, { status: 400 });
  }

  const { data: lead } = await db.from("leads").select("*").eq("id", id).single();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const before = lead.score ?? 0;
  const a = lead.analysis ?? {};

  const prompt = `You are updating a real-estate lead after a sales call in India.

LEAD:
${leadContext(lead)}

BEFORE THE CALL:
Score: ${before} (tier: ${lead.tier})
Objections: ${JSON.stringify(a.objections ?? [])}
Next action: ${a.next_action ?? ""}

CALL NOTES FROM THE SALESPERSON:
${notes}

Rescore using this rubric: timeline urgency (30), budget realism (25), intent clarity (25), engagement signals (20). tier: hot >= 70, warm 40-69, cold < 40. urgent = true if the customer wants to move within about 2 weeks or mentions a competing offer or deadline.

Rules:
- Start from the previous score of ${before}. Move it only for reasons found in the call notes. If the notes add nothing new, keep it within 5 points.
- Use only facts from the lead data and the call notes. Never invent prices, inventory or project details.
- "objections" is the FULL updated list: concerns still open plus any new ones. "resolved_objections" lists the ones the call settled.
- "what_changed": 2 to 4 short bullets explaining the score change in plain words.
- "follow_up_message": a ready-to-send message (under 70 words) that references what was discussed on the call.

Return ONLY JSON with exactly these keys:
{"new_score": 0, "new_tier": "hot|warm|cold", "urgent": false, "what_changed": ["..."], "resolved_objections": ["..."], "objections": ["..."], "next_action": "one concrete action", "follow_up_message": "..."}`;

  try {
    const d = await generateJSON(prompt, DebriefSchema);

    const analysis = {
      ...a,
      score: d.new_score,
      tier: d.new_tier,
      urgent: d.urgent,
      objections: d.objections,
      next_action: d.next_action,
      suggested_response: d.follow_up_message,
    };

    const { error: updErr } = await db
      .from("leads")
      .update({ analysis, score: d.new_score, tier: d.new_tier })
      .eq("id", id);
    if (updErr) throw new Error(updErr.message);

    const { data: call, error: callErr } = await db
      .from("calls")
      .insert({
        lead_id: id,
        notes,
        score_before: before,
        score_after: d.new_score,
        changes: {
          what_changed: d.what_changed,
          resolved_objections: d.resolved_objections,
          next_action: d.next_action,
          follow_up_message: d.follow_up_message,
        },
      })
      .select()
      .single();
    if (callErr) throw new Error(callErr.message);

    return NextResponse.json({ call, analysis, score: d.new_score, tier: d.new_tier });
  } catch (e: any) {
    console.error("Debrief error:", e);
    return NextResponse.json(
      { error: "The AI service is busy right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/supabase";
import { generateJSON, leadContext } from "@/lib/ai";

export const maxDuration = 30;

const BriefSchema = z.object({
  opening_line: z.string(),
  talking_points: z.array(z.string()),
  likely_objections: z.array(z.object({ objection: z.string(), rebuttal: z.string() })),
  questions_to_ask: z.array(z.string()),
});

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: lead } = await db.from("leads").select("*").eq("id", id).single();
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const prompt = `You are preparing a real-estate salesperson for a call in India, in the next 5 minutes.

LEAD:
${leadContext(lead)}

AI ANALYSIS:
${JSON.stringify({ ...lead.analysis, brief: undefined })}

Rules:
- Use only facts present in the lead data. Never invent inventory, prices, certificates or project details.
- If something should be verified before the call (e.g. delivery record, OC status), phrase it as "Confirm X before the call".
- The opening line must address the customer by first name. Never use placeholders like [Name] or [Your Name].

Return ONLY JSON with exactly these keys:
{"opening_line": "natural first sentence to say on the call", "talking_points": ["exactly 3 short points to emphasize"], "likely_objections": [{"objection": "short", "rebuttal": "short, 1-2 sentences"}], "questions_to_ask": ["2-3 missing-info questions to ask, e.g. financing status, decision makers"]}`;

  try {
    const brief = await generateJSON(prompt, BriefSchema);
    await db
      .from("leads")
      .update({ analysis: { ...lead.analysis, brief } })
      .eq("id", id);
    return NextResponse.json(brief);
  } catch (e: any) {
    console.error("Brief error:", e);
    return NextResponse.json(
      { error: "The AI service is busy right now. Please try again in a moment." },
      { status: 502 }
    );
  }
}
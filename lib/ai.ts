import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
export const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(prompt: string, system?: string, json = false) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      ...(system ? { systemInstruction: system } : {}),
      ...(json ? { responseMimeType: "application/json" } : {}),
      temperature: json ? 0.3 : 0.5,
    },
  });
  return res.text ?? "";
}

async function callGroq(prompt: string, system?: string, json = false) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
      temperature: json ? 0.3 : 0.5,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Gemini first (3 tries with backoff on overload), then Groq fallback
export async function callLLM(prompt: string, system?: string, json = false) {
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await callGemini(prompt, system, json);
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || e);
      if (!/503|429|UNAVAILABLE|overloaded|demand/i.test(msg)) break;
      await sleep(800 * (i + 1));
    }
  }
  if (process.env.GROQ_API_KEY) return callGroq(prompt, system, json);
  throw lastErr;
}

export const AnalysisSchema = z.object({
  summary: z.string(),
  intent: z.string(),
  key_requirements: z.array(z.string()),
  objections: z.array(z.string()),
  next_action: z.string(),
  suggested_response: z.string(),
  score: z.number().min(0).max(100),
  tier: z.enum(["hot", "warm", "cold"]),
  urgent: z.boolean(),
  reasons: z.array(z.string()),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export async function generateJSON<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T
): Promise<z.infer<T>> {
  let lastErr: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const text = await callLLM(prompt, undefined, true);
      const clean = text.replace(/```json|```/g, "").trim();
      return schema.parse(JSON.parse(clean));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function generateText(system: string, prompt: string) {
  return callLLM(prompt, system, false);
}

export type LeadInput = {
  name: string;
  location?: string;
  requirement?: string;
  budget?: string;
  timeline?: string;
  message: string;
};

export function leadContext(l: LeadInput) {
  return `Name: ${l.name}
Location: ${l.location}
Property requirement: ${l.requirement}
Budget: ${l.budget}
Buying timeline: ${l.timeline}
Customer message: ${l.message}`;
}

export async function analyzeLead(l: LeadInput): Promise<Analysis> {
  const prompt = `You are a sales analyst for an Indian real-estate team. Analyze this lead.

${leadContext(l)}

Score 0-100 using this rubric:
- Timeline urgency (30): buying within 1 month = high
- Budget realism vs the requirement (25)
- Intent clarity and specificity (25)
- Engagement signals in the message (20)
tier: hot (>=70), warm (40-69), cold (<40). urgent = true if they want to move within ~2 weeks or mention a competing offer/deadline.

Return ONLY JSON with exactly these keys:
{"summary": "2 sentences max", "intent": "one line", "key_requirements": ["short", "..."], "objections": ["short", "..."], "next_action": "one concrete action", "suggested_response": "ready-to-send reply, warm, under 80 words", "score": 0, "tier": "hot|warm|cold", "urgent": false, "reasons": ["3 short reasons for the score"]}`;
  return generateJSON(prompt, AnalysisSchema);
}
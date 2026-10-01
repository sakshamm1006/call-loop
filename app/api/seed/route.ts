import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { DEMO_LEADS } from "@/lib/demo-leads";

export async function POST() {
  const { count } = await db.from("leads").select("*", { count: "exact", head: true });
  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: "Demo leads already loaded" }, { status: 400 });
  }
  const rows = DEMO_LEADS.map((l) => ({ ...l, score: l.analysis.score, tier: l.analysis.tier }));
  const { error } = await db.from("leads").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: rows.length });
}
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const TIER: Record<string, string> = {
  hot: "bg-red-500/15 text-red-400 border-red-500/40",
  warm: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  cold: "bg-sky-500/15 text-sky-400 border-sky-500/40",
};
const FIELDS = [
  ["name", "Name"],
  ["location", "Location"],
  ["requirement", "Property requirement"],
  ["budget", "Budget"],
  ["timeline", "Buying timeline"],
] as const;
const empty = { name: "", location: "", requirement: "", budget: "", timeline: "", message: "" };

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const r = await fetch("/api/leads");
    if (r.ok) setLeads(await r.json());
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) setErr((await r.json()).error || "Something went wrong");
    else {
      setForm(empty);
      await load();
    }
    setLoading(false);
  };

  const seed = async () => {
    setSeeding(true);
    setErr("");
    const r = await fetch("/api/seed", { method: "POST" });
    if (!r.ok) setErr((await r.json()).error || "Could not load demo leads");
    await load();
    setSeeding(false);
  };

  const shown = leads.filter((l) => filter === "all" || l.tier === filter);
  const hot = leads.filter((l) => l.tier === "hot").length;
  const urgent = leads.filter((l) => l.analysis?.urgent).length;
  const avg = leads.length ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0;

  const input =
    "w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-violet-500";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            CallLoop
          </h1>
          <p className="text-slate-400">Know who to call first, and exactly what to say.</p>
        </div>
        <button
          onClick={seed}
          disabled={seeding}
          className="text-sm px-4 py-2 rounded-lg border border-violet-500/50 text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
        >
          {seeding ? "Loading..." : "✨ Load demo leads"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 max-w-xl">
        {[
          ["Hot leads", hot, "text-red-400"],
          ["Urgent", urgent, "text-amber-400"],
          ["Avg score", avg, "text-violet-300"],
        ].map(([label, val, color]) => (
          <div key={label as string} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <div className={`text-2xl font-bold ${color}`}>{val}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 h-fit">
          <h2 className="font-semibold">New lead</h2>
          {FIELDS.map(([k, label]) => (
            <input
              key={k}
              className={input}
              placeholder={label}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
          <textarea
            className={input}
            rows={5}
            placeholder="Customer message / chat transcript"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze lead"}
          </button>
        </form>

        <section>
          <div className="flex gap-2 mb-4">
            {["all", "hot", "warm", "cold"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  filter === t ? "bg-violet-600 border-violet-600" : "border-slate-700 text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {shown.map((l) => (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold w-12">{l.score}</div>
                  <div className="flex-1">
                    <Link href={`/leads/${l.id}`} className="font-semibold hover:text-violet-300">
                      {l.name} →
                    </Link>
                    <div className="text-xs text-slate-400">
                      {l.location} · {l.budget} · {l.timeline}
                    </div>
                  </div>
                  {l.analysis?.urgent && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-600/20 text-red-300 animate-pulse">
                      URGENT
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full border uppercase ${TIER[l.tier]}`}>
                    {l.tier}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-3">{l.analysis?.summary}</p>
                <p className="text-sm mt-2 text-violet-300">→ {l.analysis?.next_action}</p>
              </motion.div>
            ))}
            {!shown.length && (
              <p className="text-slate-500">
                No leads yet. Add one on the left, or click "Load demo leads" at the top.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
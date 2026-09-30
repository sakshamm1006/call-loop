"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const TIER: Record<string, string> = {
  hot: "bg-red-500/15 text-red-400 border-red-500/40",
  warm: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  cold: "bg-sky-500/15 text-sky-400 border-sky-500/40",
};
const QUICK = [
  "What should I emphasize on the call?",
  "Make my reply more assertive",
  "Make it shorter",
  "How do I handle their objections?",
];

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${accent ?? "border-slate-800 bg-slate-900/50"}`}
    >
      <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{title}</div>
      {children}
    </motion.div>
  );
}

export default function LeadPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<any>(null);
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [brief, setBrief] = useState<any>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefErr, setBriefErr] = useState("");
  const [copied, setCopied] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/leads/${id}`);
      if (r.ok) {
        const d = await r.json();
        setLead(d.lead);
        setMsgs(d.messages);
        setBrief(d.lead.analysis?.brief ?? null);
      }
    })();
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, sending]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    try {
      const r = await fetch(`/api/leads/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const d = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: d.reply || d.error || "Something went wrong" }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Network error, try again." }]);
    }
    setSending(false);
  };

  const genBrief = async () => {
    setBriefLoading(true);
    setBriefErr("");
    try {
      const r = await fetch(`/api/leads/${id}/brief`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) setBriefErr(d.error || "Failed");
      else setBrief(d);
    } catch {
      setBriefErr("Network error");
    }
    setBriefLoading(false);
  };

  if (!lead)
    return <main className="min-h-screen bg-slate-950 text-slate-400 p-6">Loading...</main>;
  const a = lead.analysis;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <Link href="/" className="text-sm text-violet-400 hover:text-violet-300">
        ← All leads
      </Link>

      <div className="flex items-center gap-4 mt-3 mb-6">
        <div className="text-5xl font-bold">{lead.score}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <div className="text-sm text-slate-400">
            {lead.location} · {lead.requirement} · {lead.budget} · {lead.timeline}
          </div>
        </div>
        {a?.urgent && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-600/20 text-red-300 animate-pulse">URGENT</span>
        )}
        <span className={`text-xs px-3 py-1 rounded-full border uppercase ${TIER[lead.tier]}`}>{lead.tier}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-4">
          <Card title="Summary">
            <p className="text-slate-200">{a.summary}</p>
            <p className="text-sm text-slate-400 mt-2">Intent: {a.intent}</p>
          </Card>

          <Card title="Next action" accent="border-violet-500/40 bg-violet-500/10">
            <p className="text-violet-200 font-medium">→ {a.next_action}</p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card title="Key requirements">
              <div className="flex flex-wrap gap-2">
                {a.key_requirements?.map((r: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
                    {r}
                  </span>
                ))}
              </div>
            </Card>
            <Card title="Objections / concerns">
              <div className="flex flex-wrap gap-2">
                {a.objections?.map((r: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-300">
                    {r}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Why this score">
            <ul className="text-sm text-slate-300 space-y-1 list-disc pl-5">
              {a.reasons?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Card>

          <Card title="Suggested response">
            <p className="text-slate-200 text-sm whitespace-pre-wrap">{a.suggested_response}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(a.suggested_response);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="mt-3 text-xs px-3 py-1 rounded-full border border-slate-600 hover:border-violet-500"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </Card>

          <Card title="📞 Pre-call brief" accent="border-pink-500/40 bg-pink-500/5">
            {!brief ? (
              <div>
                <p className="text-sm text-slate-400 mb-3">
                  A one-page cheat sheet: what to say first, what to emphasize, likely pushback, and what to ask.
                </p>
                <button
                  onClick={genBrief}
                  disabled={briefLoading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-sm font-medium disabled:opacity-50"
                >
                  {briefLoading ? "Preparing brief..." : "Generate pre-call brief"}
                </button>
                {briefErr && <p className="text-red-400 text-sm mt-2">{briefErr}</p>}
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-xs text-pink-300 mb-1">OPEN WITH</div>
                  <p className="text-slate-100 italic">“{brief.opening_line}”</p>
                </div>
                <div>
                  <div className="text-xs text-pink-300 mb-1">EMPHASIZE</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-200">
                    {brief.talking_points?.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-pink-300 mb-1">IF THEY PUSH BACK</div>
                  <div className="space-y-2">
                    {brief.likely_objections?.map((o: any, i: number) => (
                      <div key={i} className="rounded-lg bg-slate-900 p-2">
                        <div className="text-amber-300">{o.objection}</div>
                        <div className="text-slate-300">→ {o.rebuttal}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-pink-300 mb-1">ASK THEM</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-200">
                    {brief.questions_to_ask?.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={genBrief}
                  disabled={briefLoading}
                  className="text-xs px-3 py-1 rounded-full border border-slate-600 hover:border-pink-500"
                >
                  {briefLoading ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            )}
          </Card>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col h-[calc(100vh-140px)] lg:sticky lg:top-6">
          <div className="p-4 border-b border-slate-800 font-semibold">Ask about {lead.name}</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!msgs.length && (
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-violet-500"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-2xl px-3 py-2 max-w-[90%] whitespace-pre-wrap ${
                  m.role === "user" ? "ml-auto bg-violet-600" : "bg-slate-800"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && <div className="text-sm text-slate-400 animate-pulse">Thinking...</div>}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t border-slate-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="e.g. make my reply more assertive"
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            <button
              onClick={() => send(input)}
              disabled={sending}
              className="px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
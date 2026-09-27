import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LETTERS, opp, pos } from "@/lib/alphabet";
import { generateQuestion } from "@/features/questions/generators";
import type { Question } from "@/features/questions/types";
import { useProgress } from "@/features/progress/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/opposite")({
  head: () => seo("Opposite Letter Lab — Find My Opposite", "Visualise opposite letter pairs (A↔Z, B↔Y…) and play Find My Opposite using the 27 rule."),
  component: OppositeLab,
});

function OppositeLab() {
  const [sel, setSel] = useState("C");
  const o = opp(sel);
  const [q, setQ] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ c: 0, t: 0 });
  const [start, setStart] = useState(0);
  const record = useProgress((s) => s.record);
  const newQ = () => { setQ(generateQuestion("opposite", "easy")); setPicked(null); setStart(Date.now()); };
  useEffect(newQ, []);

  const answer = (a: string) => {
    if (!q || picked) return;
    setPicked(a);
    const ok = record(q, a, Date.now() - start);
    setScore((s) => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Opposite Letter Lab</h1>
        <p className="text-muted-foreground">Opposite letters always have positions whose sum is 27.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-13 gap-1">
          {LETTERS.map((l) => (
            <button key={l} onClick={() => setSel(l)} aria-pressed={l === sel}
              className={cn("aspect-square rounded-md border font-mono font-semibold transition-all", l === sel && "bg-primary text-primary-foreground", l === o && "scale-110 border-accent-strong bg-accent")}>
              {l}
            </button>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-5 text-center" aria-live="polite">
          <div className="font-mono text-4xl font-bold">{sel}</div>
          <div className="my-1 text-muted-foreground">↓ opposite ↓</div>
          <div key={o} className="font-mono text-4xl font-bold text-primary animate-in zoom-in-50 fade-in duration-300">{o}</div>
          <p className="mt-3 font-mono text-sm">27 − {pos(sel)} = {27 - pos(sel)} → {o}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold">All 13 pairs</h2>
        <div className="grid grid-cols-3 gap-2 font-mono sm:grid-cols-5 lg:grid-cols-7">
          {LETTERS.slice(0, 13).map((l) => (
            <button key={l} onClick={() => setSel(l)} className="rounded-md border bg-card px-3 py-2 hover:bg-muted">{l} ↔ {opp(l)} <span className="text-xs text-muted-foreground">{pos(l)}+{27 - pos(l)}</span></button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Find My Opposite</h2>
          <span className="font-mono text-sm">{score.c}/{score.t}</span>
        </div>
        {q && (
          <>
            <p className="mb-4 text-lg">{q.question}</p>
            <div className="grid grid-cols-4 gap-2">
              {q.options.map((op) => (
                <button key={op} onClick={() => answer(op)} disabled={!!picked}
                  className={cn("rounded-lg border py-4 font-mono text-2xl font-bold", picked && op === q.correctAnswer && "border-success bg-success/15", picked === op && op !== q.correctAnswer && "border-destructive bg-destructive/10", !picked && "hover:bg-muted")}>{op}</button>
              ))}
            </div>
            {picked && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
                <Button onClick={newQ} className="ml-auto">Next letter</Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

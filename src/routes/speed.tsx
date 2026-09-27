import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateSet } from "@/features/questions/generators";
import { TOPICS, type Question, type Topic } from "@/features/questions/types";
import { useProgress } from "@/features/progress/store";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/speed")({
  head: () => seo("Speed Arena — LetterLab", "Timed letter reasoning rounds of 30 seconds to 5 minutes. Build exam speed."),
  component: Speed,
});

const MODES = [30, 60, 120, 300];
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function Speed() {
  const attempts = useProgress((s) => s.attempts);
  const record = useProgress((s) => s.record);
  const addXp = useProgress((s) => s.addXp);
  const setBest = useProgress((s) => s.setBestSpeed);
  const [dur, setDur] = useState(60);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [q, setQ] = useState<Question | null>(null);
  const [stats, setStats] = useState({ c: 0, w: 0, s: 0 });
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const qStart = useRef(0);
  const topicsRef = useRef<Topic[]>([]);

  const nextQ = useCallback(() => {
    setQ(generateSet({ topics: topicsRef.current, difficulty: Math.random() < 0.6 ? "easy" : "medium", count: 1 })[0]);
    qStart.current = Date.now();
  }, []);

  const start = () => {
    const learned = TOPICS.map((t) => t.id).filter((t) => attempts.some((a) => a.topic === t));
    topicsRef.current = learned.length ? learned : ["numbering", "opposite", "position"];
    setStats({ c: 0, w: 0, s: 0 });
    setLeft(dur); setRunning(true); setFinished(false); nextQ();
  };

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false); setFinished(true);
      addXp(stats.c * 2);
      setBest(Math.round((stats.c / dur) * 60));
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left, dur, stats.c, addXp, setBest]);

  const answer = useCallback((a: string) => {
    if (!q || !running) return;
    const ok = record(q, a, Date.now() - qStart.current);
    setStats((s) => ({ ...s, c: s.c + (ok ? 1 : 0), w: s.w + (ok ? 0 : 1) }));
    setFlash(ok ? "ok" : "bad");
    setTimeout(() => setFlash(null), 250);
    nextQ();
  }, [q, running, record, nextQ]);

  const skip = useCallback(() => { setStats((s) => ({ ...s, s: s.s + 1 })); nextQ(); }, [nextQ]);

  useEffect(() => {
    if (!running || !q) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      const i = ["1", "2", "3", "4"].indexOf(k) >= 0 ? Number(k) - 1 : ["A", "B", "C", "D"].indexOf(k);
      if (i >= 0) answer(q.options[i]);
      else if (k === "S") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, q, answer, skip]);

  const acc = stats.c + stats.w ? ((stats.c / (stats.c + stats.w)) * 100).toFixed(1) : "0.0";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold">⚡ Speed Arena</h1>
      {!running && (
        <div className="space-y-4">
          <p className="text-muted-foreground">Questions come from topics you've already practised. Answer with 1–4, skip with S.</p>
          <div className="grid grid-cols-4 gap-2">
            {MODES.map((m) => <Button key={m} variant={dur === m ? "default" : "outline"} onClick={() => setDur(m)}>{m < 60 ? `${m}s` : `${m / 60} min`}</Button>)}
          </div>
          <Button size="lg" className="w-full" onClick={start}>{finished ? "Play again" : "Start"}</Button>
        </div>
      )}

      {(running || finished) && (
        <div className="grid grid-cols-5 gap-2 text-center font-mono">
          {[["Time", fmt(Math.max(0, left))], ["Correct", stats.c], ["Wrong", stats.w], ["Skipped", stats.s], ["Accuracy", `${acc}%`]].map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-card p-2"><div className="font-sans text-[10px] text-muted-foreground sm:text-xs">{k}</div><div className="text-sm font-bold sm:text-xl">{v}</div></div>
          ))}
        </div>
      )}

      {running && q && (
        <div className={cn("rounded-xl border bg-card p-6 transition-colors", flash === "ok" && "border-success", flash === "bad" && "border-destructive")}>
          <p className="mb-5 font-display text-xl font-semibold">{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((o, i) => (
              <button key={o} onClick={() => answer(o)} className="rounded-lg border p-4 font-mono text-xl font-bold hover:bg-muted">
                <span className="mr-2 text-xs text-muted-foreground">{i + 1}</span>{o}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={skip}>Skip (S)</Button>
        </div>
      )}

      {finished && (
        <div className="rounded-xl border border-primary bg-primary/5 p-5">
          <p className="font-display text-xl font-semibold">Round over — {stats.c} correct</p>
          <p className="text-sm text-muted-foreground">Speed: {Math.round((stats.c / dur) * 60)} correct / minute · +{stats.c * 2} bonus XP</p>
        </div>
      )}
    </div>
  );
}

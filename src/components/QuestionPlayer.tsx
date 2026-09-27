import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Flag, Keyboard, Lightbulb, Eye, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/features/questions/types";
import { topicLabel } from "@/features/questions/types";
import { useProgress } from "@/features/progress/store";
import { cn } from "@/lib/utils";

export interface PlayerResult { q: Question; answer: string | null; correct: boolean; timeMs: number }

const KEYS = ["A", "B", "C", "D"];

export function QuestionPlayer({ questions, title = "Letter Reasoning", onFinish }: { questions: Question[]; title?: string; onFinish?: (r: PlayerResult[]) => void }) {
  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, PlayerResult>>({});
  const [hints, setHints] = useState<Record<number, number>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [showKeys, setShowKeys] = useState(false);
  const [done, setDone] = useState(false);
  const start = useRef(Date.now());
  const record = useProgress((s) => s.record);
  const bookmarks = useProgress((s) => s.bookmarks);
  const toggleBookmark = useProgress((s) => s.toggleBookmark);

  const q = questions[idx];
  const res = results[idx];
  const answered = !!res;

  useEffect(() => { start.current = Date.now(); }, [idx]);

  const finish = useCallback((all: Record<number, PlayerResult>) => {
    setDone(true);
    onFinish?.(Object.values(all));
  }, [onFinish]);

  const next = useCallback(() => {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else finish(results);
  }, [idx, questions.length, results, finish]);

  const submit = useCallback(() => {
    const c = choice[idx];
    if (!c || answered) return;
    const timeMs = Date.now() - start.current;
    const correct = record(q, c, timeMs);
    setResults((r) => ({ ...r, [idx]: { q, answer: c, correct, timeMs } }));
  }, [choice, idx, answered, q, record]);

  const skip = useCallback(() => {
    if (!answered) setResults((r) => ({ ...r, [idx]: { q, answer: null, correct: false, timeMs: Date.now() - start.current } }));
    if (idx < questions.length - 1) setIdx(idx + 1);
    else finish({ ...results, [idx]: results[idx] ?? { q, answer: null, correct: false, timeMs: 0 } });
  }, [answered, idx, q, questions.length, results, finish]);

  const hint = useCallback(() => setHints((h) => ({ ...h, [idx]: Math.min((h[idx] ?? 0) + 1, q.hints.length) })), [idx, q]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey) return;
      const k = e.key.toUpperCase();
      const n = ["1", "2", "3", "4"].indexOf(k) >= 0 ? Number(k) - 1 : KEYS.indexOf(k);
      if (n >= 0 && n < q.options.length && !answered && k !== "S") { setChoice((c) => ({ ...c, [idx]: q.options[n] })); return; }
      if (k === "ENTER") { e.preventDefault(); answered ? next() : submit(); }
      else if (k === "N") next();
      else if (k === "H") hint();
      else if (k === "S") skip();
      else if (k === "?") setShowKeys((s) => !s);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, q, answered, idx, next, submit, hint, skip]);

  if (done) {
    const all = Object.values(results);
    const correct = all.filter((r) => r.correct).length;
    const attempted = all.filter((r) => r.answer).length;
    const avg = all.length ? all.reduce((a, b) => a + b.timeMs, 0) / all.length / 1000 : 0;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[["Score", `${correct}/${questions.length}`], ["Accuracy", `${attempted ? Math.round((correct / attempted) * 100) : 0}%`], ["Correct", correct], ["Wrong", attempted - correct], ["Avg time", `${avg.toFixed(1)}s`]].map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{k}</div><div className="font-mono text-2xl font-bold">{v}</div></div>
          ))}
        </div>
        <h3 className="font-display text-lg font-semibold">Solution review</h3>
        <ol className="space-y-3">
          {questions.map((qq, i) => {
            const r = results[i];
            return (
              <li key={qq.id} className="rounded-lg border bg-card p-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Q{i + 1}</span><span>·</span><span>{topicLabel(qq.topic)}</span>
                  <Badge variant={r?.correct ? "default" : "destructive"} className="ml-auto">{r?.correct ? "Correct" : r?.answer ? "Wrong" : "Skipped"}</Badge>
                </div>
                <p className="font-medium">{qq.question}</p>
                <p className="mt-1 text-sm">Your answer: <b className="font-mono">{r?.answer ?? "—"}</b> · Correct: <b className="font-mono">{qq.correctAnswer}</b></p>
                <p className="mt-1 text-sm text-muted-foreground">{qq.explanation}</p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const hintLevel = hints[idx] ?? 0;
  const bookmarked = !!bookmarks[q.id];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{title}</span>
          <span className="font-mono text-muted-foreground">Question {idx + 1} / {questions.length}</span>
        </div>
        <Progress value={((idx + (answered ? 1 : 0)) / questions.length) * 100} aria-label="Set progress" />
      </div>

      <div className="rounded-xl border bg-card p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{topicLabel(q.topic)}</Badge>
          <Badge variant="outline" className="capitalize">{q.difficulty}</Badge>
          <span className="text-xs text-muted-foreground">~{q.estimatedTime}s</span>
          <div className="ml-auto flex gap-1">
            <Button size="icon" variant="ghost" aria-label={bookmarked ? "Remove bookmark" : "Bookmark"} onClick={() => toggleBookmark(q)}>
              {bookmarked ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
            </Button>
            <Button size="icon" variant="ghost" aria-label="Report question" onClick={() => toast("Thanks — question reported for review.")}><Flag /></Button>
            <Button size="icon" variant="ghost" aria-label="Keyboard shortcuts" onClick={() => setShowKeys((s) => !s)}><Keyboard /></Button>
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold leading-snug sm:text-2xl">{q.question}</h2>

        <div className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Options">
          {q.options.map((o, i) => {
            const selected = choice[idx] === o;
            const isCorrect = answered && o === q.correctAnswer;
            const isWrong = answered && selected && o !== q.correctAnswer;
            return (
              <button
                key={o}
                role="radio"
                aria-checked={selected}
                disabled={answered}
                onClick={() => setChoice((c) => ({ ...c, [idx]: o }))}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                  selected && !answered && "border-primary bg-primary/10",
                  isCorrect && "border-success bg-success/15",
                  isWrong && "border-destructive bg-destructive/10",
                  !answered && !selected && "hover:bg-muted",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md border font-mono text-xs">{KEYS[i]}</span>
                <span className="font-mono text-lg font-semibold">{o}</span>
              </button>
            );
          })}
        </div>

        {hintLevel > 0 && (
          <ol className="mt-4 space-y-1 rounded-lg bg-muted p-3 text-sm">
            {q.hints.slice(0, hintLevel).map((h, i) => <li key={i}><b>Hint {i + 1}:</b> {h}</li>)}
          </ol>
        )}

        {(answered || showSolution[idx]) && (
          <div className={cn("mt-4 rounded-lg border p-4 text-sm", answered ? (res.correct ? "border-success bg-success/10" : "border-destructive bg-destructive/5") : "bg-muted")} aria-live="polite">
            {answered && <p className="mb-1 font-semibold">{res.correct ? "Correct!" : res.answer ? "Not quite." : "Skipped."}</p>}
            <p><b>Answer: <span className="font-mono">{q.correctAnswer}</span></b></p>
            <p className="mt-1 text-muted-foreground">{q.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}><ChevronLeft /> Previous</Button>
        <Button variant="outline" onClick={hint} disabled={answered || hintLevel >= q.hints.length}><Lightbulb /> Hint</Button>
        <Button variant="outline" onClick={() => setShowSolution((s) => ({ ...s, [idx]: true }))} disabled={answered}><Eye /> Solution</Button>
        <Button variant="ghost" onClick={skip} disabled={answered}><SkipForward /> Skip</Button>
        <div className="ml-auto flex gap-2">
          {!answered ? (
            <Button onClick={submit} disabled={!choice[idx]}>Submit</Button>
          ) : (
            <Button onClick={next}>{idx === questions.length - 1 ? "Finish" : "Next"} <ChevronRight /></Button>
          )}
        </div>
      </div>

      {showKeys && (
        <div className="rounded-lg border bg-card p-4 text-sm">
          <p className="mb-2 font-semibold">Keyboard shortcuts</p>
          <div className="grid grid-cols-2 gap-1 font-mono text-xs sm:grid-cols-3">
            <span>1–4 / A–D · option</span><span>Enter · submit / next</span><span>N · next</span><span>H · hint</span><span>S · skip</span><span>? · toggle help</span>
          </div>
        </div>
      )}
    </div>
  );
}

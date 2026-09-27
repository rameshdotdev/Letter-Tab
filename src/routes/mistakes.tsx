import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSummary, useProgress } from "@/features/progress/store";
import { topicLabel } from "@/features/questions/types";
import { LESSONS } from "@/data/lessons";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/mistakes")({
  head: () => seo("Mistake Notebook — LetterLab", "Every wrong answer saved with the correct solution, weak areas and what to study next."),
  component: Mistakes,
});

function Mistakes() {
  const s = useSummary();
  const removeMistake = useProgress((x) => x.removeMistake);
  const list = Object.values(s.mistakes).sort((a, b) => b.date.localeCompare(a.date));
  const weakest = [...s.topics].filter((t) => t.attempts > 0).sort((a, b) => a.accuracy - b.accuracy)[0];
  const lesson = weakest && LESSONS.find((l) => l.topic === weakest.id && l.id !== "basics");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">My mistakes</h1>
          <p className="text-muted-foreground">Wrong answers are saved automatically. Answer them correctly to clear them.</p>
        </div>
        <Button asChild disabled={!list.length}><Link to="/practice" search={{ mode: "mistakes" }}>Practice all mistakes</Link></Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-semibold">Weak areas</h2>
          <ul className="space-y-3">
            {s.topics.filter((t) => t.attempts > 0).map((t) => (
              <li key={t.id}>
                <div className="flex justify-between text-sm"><span>{t.label}</span><span className="font-mono">{t.accuracy}%</span></div>
                <Progress value={t.accuracy} aria-label={`${t.label} accuracy`} />
              </li>
            ))}
          </ul>
          {lesson && (
            <p className="mt-4 text-sm">Recommended: revise <Link to="/learn/$topic" params={{ topic: lesson.id }} className="font-medium text-primary underline">{lesson.title}</Link>.</p>
          )}
          {!s.total && <p className="text-sm text-muted-foreground">No data yet.</p>}
        </section>

        <section className="space-y-3 lg:col-span-2">
          {!list.length && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No mistakes saved. Nice work — or go practise!</p>}
          {list.map((m) => (
            <div key={m.q.id} className="rounded-xl border bg-card p-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{topicLabel(m.q.topic)}</Badge><span className="capitalize">{m.q.difficulty}</span><span>· {m.date}</span>
                <Button variant="ghost" size="icon" className="ml-auto size-7" aria-label="Remove mistake" onClick={() => removeMistake(m.q.id)}><Trash2 className="size-4" /></Button>
              </div>
              <p className="font-medium">{m.q.question}</p>
              <p className="mt-1 text-sm">My answer: <b className="font-mono text-destructive">{m.myAnswer}</b> · Correct: <b className="font-mono text-success">{m.q.correctAnswer}</b></p>
              <p className="mt-1 text-sm text-muted-foreground">{m.q.explanation}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

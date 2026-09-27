import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionPlayer } from "@/components/QuestionPlayer";
import { generateQuestion, generateSet } from "@/features/questions/generators";
import { DIFFICULTIES, TOPICS, type Difficulty, type Question, type Topic } from "@/features/questions/types";
import { isUnlocked, useProgress } from "@/features/progress/store";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

type Search = { topic?: string | undefined; mode?: "mistakes" | "bookmarks" | undefined };

export const Route = createFileRoute("/practice")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    topic: typeof s["topic"] === "string" ? s["topic"] : undefined,
    mode: s["mode"] === "mistakes" || s["mode"] === "bookmarks" ? s["mode"] : undefined,
  }),
  head: () => seo("Practice Mode — LetterLab", "Practise letter reasoning by topic and difficulty with progressive hints and full solutions."),
  component: Practice,
});

function Practice() {
  const search = Route.useSearch();
  const attempts = useProgress((s) => s.attempts);
  const mistakes = useProgress((s) => s.mistakes);
  const bookmarks = useProgress((s) => s.bookmarks);
  const removeMistake = useProgress((s) => s.removeMistake);
  const [topic, setTopic] = useState<Topic | "all">((TOPICS.find((t) => t.id === search.topic)?.id as Topic) ?? "all");
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [count, setCount] = useState(10);
  const [set, setSet] = useState<Question[] | null>(null);
  const [runKey, setRunKey] = useState(0);

  const begin = () => {
    setSet(topic === "all" ? generateSet({ count, difficulty: diff }) : Array.from({ length: count }, () => generateQuestion(topic, diff)));
    setRunKey((k) => k + 1);
  };
  const fromStore = (kind: "mistakes" | "bookmarks") => {
    const list = kind === "mistakes" ? Object.values(mistakes).map((m) => m.q) : Object.values(bookmarks);
    if (list.length) { setSet(list.slice(0, 30)); setRunKey((k) => k + 1); }
  };

  if (set) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSet(null)}>← Change settings</Button>
        <QuestionPlayer key={runKey} questions={set} onFinish={(rs) => rs.forEach((r) => { if (r.correct && mistakes[r.q.id]) removeMistake(r.q.id); })} />
      </div>
    );
  }

  const unlocked = (d: Difficulty) => topic === "all" ? true : isUnlocked(attempts, topic, d);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Practice mode</h1>
        <p className="text-muted-foreground">Pick a topic and level. Harder levels unlock at 70% accuracy over 5+ questions.</p>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {[{ id: "all" as const, label: "Mixed" }, ...TOPICS].map((t) => (
            <Button key={t.id} variant={topic === t.id ? "default" : "outline"} size="sm" onClick={() => { setTopic(t.id); setDiff("easy"); }}>{t.label}</Button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Difficulty</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIFFICULTIES.map((d, i) => {
            const ok = unlocked(d);
            return (
              <button key={d} disabled={!ok} onClick={() => setDiff(d)} aria-pressed={diff === d}
                className={cn("rounded-lg border p-3 text-left capitalize disabled:opacity-50", diff === d && "border-primary bg-primary/10")}>
                <div className="flex items-center justify-between font-medium">{d}{!ok && <Lock className="size-4" />}</div>
                <div className="text-xs text-primary">{"★".repeat(i + 1)}</div>
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Questions</legend>
        <div className="flex gap-2">{[5, 10, 20].map((n) => <Button key={n} size="sm" variant={count === n ? "default" : "outline"} onClick={() => setCount(n)}>{n}</Button>)}</div>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={begin}>Start practice</Button>
        <Button size="lg" variant="outline" disabled={!Object.keys(mistakes).length} onClick={() => fromStore("mistakes")}>Retry mistakes ({Object.keys(mistakes).length})</Button>
        <Button size="lg" variant="outline" disabled={!Object.keys(bookmarks).length} onClick={() => fromStore("bookmarks")}>Bookmarks ({Object.keys(bookmarks).length})</Button>
      </div>
      {search.mode && <AutoStart run={() => fromStore(search.mode!)} />}
    </div>
  );
}

function AutoStart({ run }: { run: () => void }) {
  const [done, setDone] = useState(false);
  if (!done) queueMicrotask(() => { setDone(true); run(); });
  return null;
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useClientValue } from "@/hooks/use-client-value";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlphabetStrip } from "@/components/AlphabetStrip";
import { QuestionPlayer } from "@/components/QuestionPlayer";
import { LESSONS } from "@/data/lessons";
import { generateQuestion } from "@/features/questions/generators";
import { useProgress } from "@/features/progress/store";
import { LETTERS, letter, opp, pos } from "@/lib/alphabet";

export const Route = createFileRoute("/learn/$topic")({
  loader: ({ params }) => {
    const lesson = LESSONS.find((l) => l.id === params.topic);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Lesson not found" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.lesson.title} — LetterLab lesson`;
    return { meta: [{ title: t }, { name: "description", content: loaderData.lesson.summary }, { property: "og:title", content: t }, { property: "og:description", content: loaderData.lesson.summary }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] };
  },
  component: LessonPage,
});

function Visual({ kind }: { kind: string }) {
  if (kind === "strip") return <AlphabetStrip />;
  if (kind === "opposite")
    return (
      <div className="grid grid-cols-13 gap-1 font-mono text-sm">
        {LETTERS.slice(0, 13).map((l) => (
          <div key={l} className="flex flex-col items-center gap-1 rounded-md border bg-card py-2">
            <b>{l}</b><span className="text-muted-foreground">↕</span><b className="text-primary">{opp(l)}</b>
          </div>
        ))}
      </div>
    );
  if (kind === "positions")
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-center font-mono text-xs">
          <tbody>
            <tr><th className="pr-2 text-left font-sans text-muted-foreground">Left</th>{LETTERS.map((l) => <td key={l}>{pos(l)}</td>)}</tr>
            <tr className="text-base font-bold"><th /> {LETTERS.map((l) => <td key={l}>{l}</td>)}</tr>
            <tr><th className="pr-2 text-left font-sans text-muted-foreground">Right</th>{LETTERS.map((l) => <td key={l} className="text-primary">{27 - pos(l)}</td>)}</tr>
          </tbody>
        </table>
      </div>
    );
  if (kind === "series")
    return (
      <div className="flex flex-wrap items-center gap-2 font-mono">
        {[2, 5, 8, 11, 14].map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div className={`rounded-md border px-3 py-2 text-center ${i === 4 ? "border-primary bg-primary/10" : "bg-card"}`}><b>{i === 4 ? "?" : letter(p)}</b><div className="text-xs text-muted-foreground">{p}</div></div>
            {i < 4 && <span className="text-xs text-primary">+3</span>}
          </div>
        ))}
      </div>
    );
  if (kind === "analogy")
    return (
      <div className="flex flex-wrap items-center gap-3 font-mono text-lg">
        <span>B(2)</span><span className="text-primary">→+3→</span><span>E(5)</span><span className="text-muted-foreground">::</span><span>D(4)</span><span className="text-primary">→+3→</span><span className="rounded border border-primary px-2">G(7)</span>
      </div>
    );
  return (
    <div className="grid grid-cols-3 gap-2 font-mono text-center text-lg sm:w-80">
      {"CAT".split("").map((c) => <div key={c} className="rounded-md border bg-card p-2">{c}<div className="text-primary">↓ +1</div>{letter(pos(c) + 1)}</div>)}
    </div>
  );
}

function LessonPage() {
  const { lesson } = Route.useLoaderData();
  const completeLesson = useProgress((s) => s.completeLesson);
  const done = useProgress((s) => s.lessons.includes(lesson.id));
  const [guided, setGuided] = useState(false);
  const qs = useClientValue(() => [generateQuestion(lesson.topic, "easy"), generateQuestion(lesson.topic, "easy"), generateQuestion(lesson.topic, "medium")], [lesson.topic, guided]);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = LESSONS[idx + 1];

  return (
    <article className="space-y-8">
      <header>
        <Link to="/learn" className="text-sm text-muted-foreground hover:underline">← Roadmap</Link>
        <p className="mt-3 font-mono text-xs text-primary">LEVEL {lesson.level}</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{lesson.title}</h1>
        <p className="mt-1 text-muted-foreground">{lesson.summary}</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">1. Concept</h2>
        {lesson.concept.map((c, i) => <p key={i} className="max-w-3xl leading-relaxed">{c}</p>)}
        <div className="flex flex-wrap gap-3 pt-2">
          {lesson.formulas.map((f) => (
            <div key={f.label} className="rounded-lg border-l-4 border-primary bg-card px-4 py-2">
              <div className="text-xs text-muted-foreground">{f.label}</div>
              <div className="font-mono font-semibold">{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">2. Visual demonstration</h2>
        <div className="rounded-xl border bg-muted/40 p-4"><Visual kind={lesson.visual} /></div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">3. Worked examples</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {lesson.examples.map((e) => (
            <div key={e.q} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{e.q}</p>
              <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-muted-foreground">{e.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              <p className="mt-2 font-mono font-bold text-primary">Answer: {e.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">4. Guided practice</h2>
        {qs && <QuestionPlayer key={String(guided)} questions={qs} title={`${lesson.title} · guided`} onFinish={() => {
          if (!done) { completeLesson(lesson.id); toast.success("Lesson complete! +50 XP"); }
        }} />}
        <Button variant="ghost" size="sm" onClick={() => setGuided((g) => !g)}>New guided set</Button>
      </section>

      <section className="flex flex-wrap gap-3 border-t pt-6">
        {!done && <Button variant="outline" onClick={() => { completeLesson(lesson.id); toast.success("Lesson marked complete. +50 XP"); }}>Mark lesson complete</Button>}
        <Button asChild><Link to="/practice" search={{ topic: lesson.topic }}>Practice this topic</Link></Button>
        {nextLesson && <Button variant="outline" asChild><Link to="/learn/$topic" params={{ topic: nextLesson.id }}>Next: {nextLesson.title} →</Link></Button>}
      </section>
    </article>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSummary } from "@/features/progress/store";
import { LESSONS } from "@/data/lessons";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => seo("Dashboard — LetterLab", "Your letter reasoning progress, streak, XP, badges and next recommended lesson."),
  component: Dashboard,
});

export function mastery(s: ReturnType<typeof useSummary>, lessonId: string) {
  const l = LESSONS.find((x) => x.id === lessonId)!;
  const t = s.topics.find((x) => x.id === l.topic)!;
  return Math.min(100, (s.lessons.includes(lessonId) ? 30 : 0) + Math.min(70, t.correct * 3));
}

function Dashboard() {
  const s = useSummary();
  const next = LESSONS.find((l) => !s.lessons.includes(l.id)) ?? LESSONS[0];
  const stats = [
    ["Level", s.level], ["XP", s.xp.toLocaleString()], ["Streak", `${s.streak} 🔥`], ["Solved", s.total],
    ["Correct", s.correct], ["Accuracy", `${s.accuracy}%`], ["Avg time", `${s.avgTime.toFixed(1)}s`], ["Mistakes", Object.keys(s.mistakes).length],
  ];
  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Master Letter Reasoning</h1>
        <p className="mt-1 text-muted-foreground">Learn the Alphabet. Think Faster. Solve Smarter.</p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="font-mono text-2xl font-bold">{v}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">Your progress</h2>
          <ul className="space-y-3">
            {LESSONS.map((l) => {
              const m = mastery(s, l.id);
              return (
                <li key={l.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[180px_1fr_48px]">
                  <Link to="/learn/$topic" params={{ topic: l.id }} className="text-sm font-medium hover:underline">{l.title}</Link>
                  <span className="text-right font-mono text-xs sm:order-last">{m}%</span>
                  <Progress value={m} className="col-span-2 sm:col-span-1" aria-label={`${l.title} progress`} />
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-primary bg-primary/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Recommended next</p>
            <h3 className="mt-1 font-display text-xl font-semibold">Level {next.level} — {next.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{next.summary}</p>
            <Button className="mt-4" asChild><Link to="/learn/$topic" params={{ topic: next.id }}>Start lesson</Link></Button>
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h3 className="mb-2 font-display font-semibold">Weak topics</h3>
            {s.weak.length ? (
              <ul className="space-y-1 text-sm">{s.weak.map((w) => <li key={w.id} className="flex justify-between"><span>{w.label}</span><span className="font-mono text-destructive">{w.accuracy}%</span></li>)}</ul>
            ) : <p className="text-sm text-muted-foreground">None yet — keep practising to find out.</p>}
            <Button variant="outline" size="sm" className="mt-3" asChild><Link to="/practice">Practice now</Link></Button>
          </section>
        </div>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {s.badges.map((b) => (
            <div key={b.id} className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${b.earned ? "" : "opacity-40 grayscale"}`}>
              <span className="text-xl" aria-hidden>{b.icon}</span>{b.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

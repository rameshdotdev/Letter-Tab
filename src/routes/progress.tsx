import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { useProgress, useSummary } from "@/features/progress/store";
import { DIFFICULTIES } from "@/features/questions/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/progress")({
  head: () => seo("Profile & Progress — LetterLab", "Your level, XP, accuracy, speed, topic performance charts, achievements and recent activity."),
  component: ProgressPage,
});

const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" } };

function ProgressPage() {
  const s = useSummary();
  const setName = useProgress((x) => x.setName);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const a = s.attempts.filter((x) => x.date === key);
    return { day: key.slice(5), solved: a.length, correct: a.filter((x) => x.correct).length };
  });
  const diff = DIFFICULTIES.map((d) => {
    const a = s.attempts.filter((x) => x.difficulty === d);
    return { d, accuracy: a.length ? Math.round((a.filter((x) => x.correct).length / a.length) * 100) : 0 };
  });
  const recent = [...s.attempts].reverse().slice(0, 8);

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center gap-4">
        <div className="grid size-16 place-items-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">{s.name[0]?.toUpperCase() ?? "S"}</div>
        <div>
          <label htmlFor="name" className="sr-only">Your name</label>
          <Input id="name" value={s.name} onChange={(e) => setName(e.target.value.slice(0, 40))} className="h-9 w-56 font-display text-xl font-bold" />
          <p className="mt-1 text-sm text-muted-foreground">Level {s.level} · {s.xp} XP · {s.streak} day streak</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Questions solved", s.total], ["Accuracy", `${s.accuracy}%`], ["Best speed", `${s.bestSpeed}/min`], ["Lessons completed", s.lessons.length]].map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4"><div className="text-xs text-muted-foreground">{k}</div><div className="font-mono text-2xl font-bold">{v}</div></div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-semibold">Last 14 days</h2>
          <div className="h-56">
            <ResponsiveContainer><BarChart data={days}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" fontSize={10} stroke="var(--muted-foreground)" /><YAxis fontSize={10} stroke="var(--muted-foreground)" allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="solved" fill="var(--chart-2)" radius={3} /><Bar dataKey="correct" fill="var(--chart-1)" radius={3} /></BarChart></ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-semibold">Topic accuracy</h2>
          <div className="h-56">
            <ResponsiveContainer><BarChart data={s.topics} layout="vertical"><XAxis type="number" domain={[0, 100]} fontSize={10} stroke="var(--muted-foreground)" /><YAxis type="category" dataKey="label" width={120} fontSize={11} stroke="var(--muted-foreground)" /><Tooltip {...tip} /><Bar dataKey="accuracy" fill="var(--chart-1)" radius={3} /></BarChart></ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-semibold">Difficulty performance</h2>
          <div className="h-48">
            <ResponsiveContainer><BarChart data={diff}><XAxis dataKey="d" fontSize={11} stroke="var(--muted-foreground)" /><YAxis domain={[0, 100]} fontSize={10} stroke="var(--muted-foreground)" /><Tooltip {...tip} /><Bar dataKey="accuracy" fill="var(--chart-3)" radius={3} /></BarChart></ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-display font-semibold">Achievements</h2>
          <div className="grid grid-cols-2 gap-2">
            {s.badges.map((b) => <div key={b.id} className={`rounded-lg border p-2 text-sm ${b.earned ? "" : "opacity-40 grayscale"}`}>{b.icon} {b.label}</div>)}
          </div>
          <h3 className="mb-2 mt-5 font-display font-semibold">Recent activity</h3>
          <ul className="space-y-1 text-sm">
            {recent.map((a) => <li key={a.ts} className="flex justify-between"><span className="capitalize">{a.topic} · {a.difficulty}</span><span className={a.correct ? "text-success" : "text-destructive"}>{a.correct ? "✓" : "✗"} {(a.timeMs / 1000).toFixed(1)}s</span></li>)}
            {!recent.length && <li className="text-muted-foreground">No activity yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

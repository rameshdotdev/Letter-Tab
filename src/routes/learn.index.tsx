import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { LESSONS } from "@/data/lessons";
import { useSummary } from "@/features/progress/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/")({
  head: () => seo("Learning Roadmap — LetterLab", "A level-by-level campaign from alphabet foundations to exam-level coding-decoding."),
  component: Roadmap,
});

function Roadmap() {
  const { lessons } = useSummary();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Learning roadmap</h1>
      <p className="mt-1 text-muted-foreground">Complete each level to build the next skill. You can jump ahead any time.</p>
      <ol className="relative mt-8 space-y-4 border-l-2 border-dashed pl-6">
        {LESSONS.map((l, i) => {
          const done = lessons.includes(l.id);
          const current = !done && LESSONS.slice(0, i).every((p) => lessons.includes(p.id));
          return (
            <li key={l.id} className="relative">
              <span className={cn("absolute -left-[37px] grid size-6 place-items-center rounded-full border-2 bg-background font-mono text-xs", done && "border-success bg-success text-primary-foreground", current && "border-primary")}>
                {done ? <Check className="size-3" /> : current ? l.level : <Lock className="size-3 text-muted-foreground" />}
              </span>
              <Link to="/learn/$topic" params={{ topic: l.id }} className={cn("block rounded-xl border bg-card p-5 transition-colors hover:border-primary", current && "border-primary")}>
                <p className="font-mono text-xs text-muted-foreground">LEVEL {l.level} {"★".repeat(Math.min(5, Math.ceil(l.level / 1.5)))}</p>
                <h2 className="font-display text-lg font-semibold">{l.title}</h2>
                <p className="text-sm text-muted-foreground">{l.summary}</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

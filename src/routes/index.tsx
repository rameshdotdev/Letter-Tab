import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, GraduationCap, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlphabetStrip } from "@/components/AlphabetStrip";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("LetterLab — Master Alphabet Reasoning From Zero to Advanced", "Learn letter positions, opposite letters, alphabet numbering, series and coding-decoding through interactive practice for SSC, DSSSB, BPSC, Railway and Banking exams."),
  component: Landing,
});

const FEATURES = [
  { icon: BookOpen, title: "Learn step-by-step", text: "Concept first, then worked examples and guided practice for every topic." },
  { icon: Target, title: "Practice smarter", text: "Progressive hints teach the reasoning instead of just revealing answers." },
  { icon: Zap, title: "Improve your speed", text: "Speed Arena rounds of 30 seconds to 5 minutes build exam reflexes." },
  { icon: BarChart3, title: "Track your progress", text: "Accuracy, speed and weak topics — plus a mistake notebook that remembers for you." },
  { icon: GraduationCap, title: "Master competitive exams", text: "Question styles modelled on SSC, DSSSB, BPSC, Railway, Banking and CTET papers." },
];

function Landing() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-sm text-primary">A = 1 · Z = 26 · A ↔ Z</p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Master Alphabet Reasoning From Zero to Advanced.</h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">Learn letter positions, opposite letters, alphabet numbering, series, coding-decoding and more through interactive practice.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/learn">Start Learning</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/lab">Try Alphabet Lab</Link></Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <p className="mb-3 text-sm font-medium">Tap any letter</p>
          <AlphabetStrip initial="H" />
        </div>
      </section>

      <section>
        <h2 className="mb-6 font-display text-2xl font-bold">Learn → Understand → Practice → Speed → Master</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5">
              <f.icon className="mb-3 size-6 text-primary" />
              <h3 className="font-display font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
          <Link to="/dashboard" className="flex flex-col justify-center rounded-xl border border-primary bg-primary/5 p-5 hover:bg-primary/10">
            <span className="font-display text-lg font-semibold">Open your dashboard →</span>
            <span className="text-sm text-muted-foreground">No sign-up needed. Progress is saved on this device.</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

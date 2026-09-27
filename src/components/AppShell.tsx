import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Flame, FlaskConical, Home, LayoutDashboard, Moon, NotebookPen, Search, Sun, Target, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useSummary } from "@/features/progress/store";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/speed", label: "Speed Arena", icon: Zap },
  { to: "/mistakes", label: "Mistakes", icon: NotebookPen },
] as const;

const MOBILE = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/speed", label: "Play", icon: Zap },
  { to: "/progress", label: "Profile", icon: User },
] as const;

type SearchItem = { label: string; keywords: string; to: string; params?: { topic: string } };
const SEARCH: SearchItem[] = [
  { label: "Alphabet basics (A = 1)", keywords: "a=1 positions ejoty basics", to: "/learn/$topic", params: { topic: "basics" } },
  { label: "Reverse alphabet numbering", keywords: "reverse z=1 numbering", to: "/learn/$topic", params: { topic: "numbering" } },
  { label: "Opposite letters lesson", keywords: "opposite 27 pairs", to: "/learn/$topic", params: { topic: "opposite" } },
  { label: "Position from right", keywords: "position left right both sides", to: "/learn/$topic", params: { topic: "position" } },
  { label: "Letter series", keywords: "series next letter pattern", to: "/learn/$topic", params: { topic: "series" } },
  { label: "Letter analogy", keywords: "analogy ::", to: "/learn/$topic", params: { topic: "analogy" } },
  { label: "Coding-decoding", keywords: "coding decoding code shift", to: "/learn/$topic", params: { topic: "coding" } },
  { label: "ABCD Numbering Lab", keywords: "lab word value sum cat computer distance between", to: "/lab" },
  { label: "Find My Opposite game", keywords: "opposite game lab", to: "/opposite" },
  { label: "Speed Arena", keywords: "speed timer arena", to: "/speed" },
  { label: "Practice mode", keywords: "practice questions", to: "/practice" },
  { label: "Mistake notebook", keywords: "mistakes wrong revision", to: "/mistakes" },
  { label: "Progress & profile", keywords: "progress profile charts badges", to: "/progress" },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("theme", d ? "dark" : "light");
  };
  return <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</Button>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { xp, streak } = useSummary();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !(e.target instanceof HTMLInputElement))) { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-sm text-primary-foreground">Az</span>
            <span className="hidden sm:inline">LetterLab</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-muted text-foreground font-medium" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2 text-muted-foreground">
              <Search className="size-4" /><span className="hidden lg:inline">Search</span><kbd className="hidden font-mono text-xs lg:inline">/</kbd>
            </Button>
            <span className="hidden items-center gap-1 px-2 font-mono text-sm sm:flex" title="Streak"><Flame className="size-4 text-primary" />{streak}</span>
            <Link to="/progress" className="hidden rounded-md px-2 font-mono text-sm sm:block">{xp} XP</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background md:hidden" aria-label="Mobile">
        {MOBILE.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="size-5" />{n.label}
          </Link>
        ))}
      </nav>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search lessons & tools… e.g. opposite, A = 1, series" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Go to">
            {SEARCH.map((s) => (
              <CommandItem key={s.label} value={`${s.label} ${s.keywords}`} onSelect={() => { setOpen(false); navigate({ to: s.to, params: s.params } as never); }}>
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

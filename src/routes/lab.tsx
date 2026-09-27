import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlphabetStrip } from "@/components/AlphabetStrip";
import { LETTERS, VOWELS, cleanWord, letter, opp, pos } from "@/lib/alphabet";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/lab")({
  head: () => seo("ABCD Numbering Lab — LetterLab", "Type any word to see letter values, sums, averages, opposites and distances between letters."),
  component: Lab,
});

function Stat({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="rounded-lg border bg-card p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="break-all font-mono text-lg font-semibold">{v}</div></div>;
}

function WordLab() {
  const [raw, setRaw] = useState("COMPUTER");
  const [reverse, setReverse] = useState(false);
  const w = cleanWord(raw).slice(0, 20);
  const val = (c: string) => (reverse ? 27 - pos(c) : pos(c));
  const vals = w.split("").map(val);
  const sum = vals.reduce((a, b) => a + b, 0);
  const product = vals.reduce((a, b) => a * b, 1);
  const repeated = [...new Set(w.split("").filter((c, i, a) => a.indexOf(c) !== i))];
  const diffs = vals.slice(1).map((v, i) => v - vals[i]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grow space-y-1">
          <Label htmlFor="word">Enter a word</Label>
          <Input id="word" value={raw} onChange={(e) => setRaw(e.target.value)} className="font-mono text-lg uppercase" maxLength={20} />
        </div>
        <div className="flex rounded-md border p-1 text-sm" role="group" aria-label="Numbering mode">
          <button className={cn("rounded px-3 py-1", !reverse && "bg-primary text-primary-foreground")} onClick={() => setReverse(false)}>A = 1</button>
          <button className={cn("rounded px-3 py-1", reverse && "bg-primary text-primary-foreground")} onClick={() => setReverse(true)}>Z = 1</button>
        </div>
      </div>
      {w ? (
        <>
          <div className="flex flex-wrap gap-2">
            {w.split("").map((c, i) => (
              <div key={i} className={cn("w-12 rounded-md border p-2 text-center", VOWELS.has(c) ? "bg-accent" : "bg-card")}>
                <div className="font-mono text-xl font-bold">{c}</div>
                <div className="font-mono text-xs text-primary">{val(c)}</div>
              </div>
            ))}
          </div>
          <p className="font-mono text-sm">{w} = {vals.join(" - ")}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat k="Sum" v={`${vals.join(" + ")} = ${sum}`} />
            <Stat k="Average" v={(sum / vals.length).toFixed(2)} />
            <Stat k="Product" v={product.toLocaleString()} />
            <Stat k="First − Last" v={`${vals[0]} − ${vals[vals.length - 1]} = ${vals[0] - vals[vals.length - 1]}`} />
            <Stat k="Highest" v={`${w[vals.indexOf(Math.max(...vals))]} (${Math.max(...vals)})`} />
            <Stat k="Lowest" v={`${w[vals.indexOf(Math.min(...vals))]} (${Math.min(...vals)})`} />
            <Stat k="Middle letter" v={w.length % 2 ? w[(w.length - 1) / 2] : `${w[w.length / 2 - 1]}${w[w.length / 2]}`} />
            <Stat k="Alphabetical" v={[...w].sort().join("")} />
            <Stat k="Reverse order" v={[...w].reverse().join("")} />
            <Stat k="Opposites" v={w.split("").map(opp).join("")} />
            <Stat k="Vowels / Consonants" v={`${w.split("").filter((c) => VOWELS.has(c)).length} / ${w.split("").filter((c) => !VOWELS.has(c)).length}`} />
            <Stat k="Repeated" v={repeated.join(", ") || "none"} />
          </div>
          {diffs.length > 0 && <p className="text-sm text-muted-foreground">Position differences: <span className="font-mono">{diffs.map((d) => (d > 0 ? `+${d}` : d)).join(", ")}</span></p>}
        </>
      ) : <p className="text-muted-foreground">Type letters A–Z to begin.</p>}
    </div>
  );
}

function DistanceLab() {
  const [a, setA] = useState("D");
  const [b, setB] = useState("K");
  const [lo, hi] = [Math.min(pos(a), pos(b)), Math.max(pos(a), pos(b))];
  const between = LETTERS.slice(lo, hi - 1);
  const select = (l: string) => { setA(b); setB(l); };
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Tap two letters to compare them.</p>
      <div className="grid grid-cols-13 gap-1">
        {LETTERS.map((l) => (
          <button key={l} onClick={() => select(l)} aria-pressed={l === a || l === b}
            className={cn("aspect-square rounded-md border font-mono font-semibold", (l === a || l === b) ? "bg-primary text-primary-foreground" : between.includes(l) ? "bg-accent" : "bg-card hover:bg-muted")}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat k="Pair" v={`${a} (${pos(a)}) — ${b} (${pos(b)})`} />
        <Stat k="Distance" v={hi - lo} />
        <Stat k="Letters between" v={between.length} />
        <Stat k="Which are" v={between.join(", ") || "none"} />
      </div>
      <p className="font-mono text-sm">Letters between = Difference − 1 = {hi - lo} − 1 = {Math.max(0, hi - lo - 1)}</p>
    </div>
  );
}

function Table({ reverse }: { reverse: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-1 font-mono text-sm sm:grid-cols-7 lg:grid-cols-13">
      {(reverse ? [...LETTERS].reverse() : LETTERS).map((l, i) => (
        <div key={l} className="rounded-md border bg-card p-2 text-center"><b>{l}</b> → <span className="text-primary">{i + 1}</span></div>
      ))}
    </div>
  );
}

function Lab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">ABCD Numbering Lab</h1>
        <p className="text-muted-foreground">Experiment freely — every number is calculated instantly.</p>
      </div>
      <Tabs defaultValue="word">
        <TabsList className="flex-wrap">
          <TabsTrigger value="word">Word values</TabsTrigger>
          <TabsTrigger value="letter">Letter explorer</TabsTrigger>
          <TabsTrigger value="distance">Distance</TabsTrigger>
          <TabsTrigger value="forward">A → 1</TabsTrigger>
          <TabsTrigger value="reverse">Z → 1</TabsTrigger>
        </TabsList>
        <TabsContent value="word" className="pt-4"><WordLab /></TabsContent>
        <TabsContent value="letter" className="pt-4"><AlphabetStrip /></TabsContent>
        <TabsContent value="distance" className="pt-4"><DistanceLab /></TabsContent>
        <TabsContent value="forward" className="pt-4"><Table reverse={false} /></TabsContent>
        <TabsContent value="reverse" className="pt-4"><Table reverse /></TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">Tip: {letter(5)}={5}, {letter(10)}={10}, {letter(15)}={15}, {letter(20)}={20}, {letter(25)}={25} — remember “EJOTY”.</p>
    </div>
  );
}

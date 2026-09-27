import { useState } from "react";
import { LETTERS, opp, pos, VOWELS } from "@/lib/alphabet";
import { cn } from "@/lib/utils";

export function AlphabetStrip({ initial = "M", compact = false }: { initial?: string; compact?: boolean }) {
  const [sel, setSel] = useState(initial);
  const o = opp(sel);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-13 gap-1 sm:gap-1.5" role="listbox" aria-label="Alphabet">
        {LETTERS.map((l) => (
          <button
            key={l}
            role="option"
            aria-selected={l === sel}
            onClick={() => setSel(l)}
            className={cn(
              "aspect-square rounded-md border font-mono text-sm font-semibold transition-colors sm:text-base",
              l === sel ? "border-primary bg-primary text-primary-foreground" : l === o ? "border-accent-strong bg-accent text-accent-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {l}
            {!compact && <span className="block text-[9px] font-normal opacity-60">{pos(l)}</span>}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
        {[
          ["Letter", sel],
          ["Position", pos(sel)],
          ["Reverse position", 27 - pos(sel)],
          ["Opposite", `${o} (${pos(o)})`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="font-mono text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>
      {!compact && (
        <p className="text-sm text-muted-foreground">
          {sel} is a {VOWELS.has(sel) ? "vowel" : "consonant"} · {pos(sel)} + {pos(o)} = 27
        </p>
      )}
    </div>
  );
}

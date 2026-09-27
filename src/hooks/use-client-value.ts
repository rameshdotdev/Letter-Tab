import { useEffect, useState, type DependencyList } from "react";

/** Compute a random/browser-only value after hydration to avoid SSR mismatches. */
export function useClientValue<T>(fn: () => T, deps: DependencyList): T | null {
  const [v, setV] = useState<T | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setV(fn()), deps);
  return v;
}

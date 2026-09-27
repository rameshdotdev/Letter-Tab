import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Difficulty, Question, Topic } from "@/features/questions/types";
import { TOPICS } from "@/features/questions/types";

export interface Attempt { topic: Topic; difficulty: Difficulty; correct: boolean; timeMs: number; date: string; ts: number }
export interface Mistake { q: Question; myAnswer: string; date: string }

interface State {
  name: string;
  xp: number;
  attempts: Attempt[];
  mistakes: Record<string, Mistake>;
  bookmarks: Record<string, Question>;
  lessons: string[];
  activeDays: string[];
  bestSpeed: number;
  record: (q: Question, answer: string, timeMs: number) => boolean;
  addXp: (n: number) => void;
  completeLesson: (id: string) => void;
  removeMistake: (id: string) => void;
  toggleBookmark: (q: Question) => void;
  setBestSpeed: (n: number) => void;
  setName: (n: string) => void;
}

export const today = () => new Date().toISOString().slice(0, 10);

const touch = (days: string[]) => (days.includes(today()) ? days : [...days, today()]);

export const useProgress = create<State>()(
  persist(
    (set, get) => ({
      name: "Student",
      xp: 0,
      attempts: [],
      mistakes: {},
      bookmarks: {},
      lessons: [],
      activeDays: [],
      bestSpeed: 0,
      record: (q, answer, timeMs) => {
        const correct = answer === q.correctAnswer;
        const s = get();
        const mistakes = { ...s.mistakes };
        if (!correct) mistakes[q.id] = { q, myAnswer: answer, date: today() };
        const bonus = { easy: 5, medium: 8, hard: 12, expert: 15 }[q.difficulty];
        const fast = correct && timeMs < q.estimatedTime * 1000 ? 2 : 0;
        set({
          attempts: [...s.attempts, { topic: q.topic, difficulty: q.difficulty, correct, timeMs, date: today(), ts: Date.now() }].slice(-3000),
          mistakes,
          xp: s.xp + (correct ? bonus + fast : 1),
          activeDays: touch(s.activeDays),
        });
        return correct;
      },
      addXp: (n) => set((s) => ({ xp: s.xp + n, activeDays: touch(s.activeDays) })),
      completeLesson: (id) => {
        const s = get();
        if (s.lessons.includes(id)) return;
        set({ lessons: [...s.lessons, id], xp: s.xp + 50, activeDays: touch(s.activeDays) });
      },
      removeMistake: (id) => set((s) => { const m = { ...s.mistakes }; delete m[id]; return { mistakes: m }; }),
      toggleBookmark: (q) => set((s) => { const b = { ...s.bookmarks }; if (b[q.id]) delete b[q.id]; else b[q.id] = q; return { bookmarks: b }; }),
      setBestSpeed: (n) => set((s) => ({ bestSpeed: Math.max(s.bestSpeed, n) })),
      setName: (name) => set({ name }),
    }),
    { name: "letter-reasoning-progress", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export function computeStreak(days: string[]) {
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export function topicStats(attempts: Attempt[]) {
  return TOPICS.map((t) => {
    const a = attempts.filter((x) => x.topic === t.id);
    const correct = a.filter((x) => x.correct).length;
    return { ...t, attempts: a.length, correct, accuracy: a.length ? Math.round((correct / a.length) * 100) : 0 };
  });
}

export function isUnlocked(attempts: Attempt[], topic: Topic, d: Difficulty) {
  const order: Difficulty[] = ["easy", "medium", "hard", "expert"];
  const i = order.indexOf(d);
  if (i === 0) return true;
  const prev = attempts.filter((a) => a.topic === topic && a.difficulty === order[i - 1]);
  return prev.length >= 5 && prev.filter((a) => a.correct).length / prev.length >= 0.7;
}

export const levelFromXp = (xp: number) => Math.floor(xp / 250) + 1;

export function useSummary() {
  const s = useProgress();
  const total = s.attempts.length;
  const correct = s.attempts.filter((a) => a.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const avgTime = total ? s.attempts.reduce((a, b) => a + b.timeMs, 0) / total / 1000 : 0;
  const streak = computeStreak(s.activeDays);
  const topics = topicStats(s.attempts);
  const weak = topics.filter((t) => t.attempts >= 3 && t.accuracy < 70);
  const badges = [
    { id: "rookie", label: "Alphabet Rookie", icon: "🏅", earned: s.lessons.length >= 1 },
    { id: "number", label: "Number Master", icon: "🔢", earned: (topics.find((t) => t.id === "numbering")?.correct ?? 0) >= 20 },
    { id: "opp", label: "Opposite Expert", icon: "🔁", earned: (topics.find((t) => t.id === "opposite")?.correct ?? 0) >= 20 },
    { id: "pattern", label: "Pattern Hunter", icon: "🧠", earned: (topics.find((t) => t.id === "series")?.correct ?? 0) >= 20 },
    { id: "speed", label: "Speed Solver", icon: "⚡", earned: s.bestSpeed >= 15 },
    { id: "streak", label: "7 Day Streak", icon: "🔥", earned: streak >= 7 },
    { id: "hundred", label: "Century", icon: "💯", earned: correct >= 100 },
    { id: "master", label: "Letter Reasoning Master", icon: "🏆", earned: topics.every((t) => t.correct >= 30 && t.accuracy >= 80) },
  ];
  return { ...s, total, correct, accuracy, avgTime, streak, topics, weak, badges, level: levelFromXp(s.xp) };
}

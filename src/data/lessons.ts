import type { Topic } from "@/features/questions/types";

export interface Lesson {
  id: string;
  level: number;
  title: string;
  topic: Topic;
  summary: string;
  concept: string[];
  formulas: { label: string; value: string }[];
  examples: { q: string; steps: string[]; answer: string }[];
  visual: "strip" | "opposite" | "positions" | "series" | "analogy" | "coding";
}

export const LESSONS: Lesson[] = [
  {
    id: "basics", level: 1, title: "Alphabet Foundations", topic: "numbering", visual: "strip",
    summary: "A–Z order, forward and backward counting, and the numeric value of every letter.",
    concept: [
      "The English alphabet has 26 letters. Every letter has a fixed position: A = 1, B = 2 … Z = 26.",
      "Almost every letter-reasoning question starts by converting letters into numbers. Once you can do this instantly, everything else becomes arithmetic.",
      "Memorise the anchor word EJOTY: E = 5, J = 10, O = 15, T = 20, Y = 25. From any anchor you are at most 2 steps away from any letter.",
    ],
    formulas: [{ label: "EJOTY anchors", value: "E=5 · J=10 · O=15 · T=20 · Y=25" }, { label: "Reverse value", value: "27 − Position" }],
    examples: [
      { q: "What is the position of R?", steps: ["Nearest anchor: T = 20.", "R is 2 before T.", "20 − 2 = 18."], answer: "18" },
      { q: "Which letter is 12th?", steps: ["Anchor J = 10.", "10 + 2 = 12.", "J → K → L."], answer: "L" },
    ],
  },
  {
    id: "numbering", level: 2, title: "Alphabet Numbering", topic: "numbering", visual: "strip",
    summary: "Forward and reverse numbering, word values and sums.",
    concept: [
      "Forward numbering: A = 1 … Z = 26. Reverse numbering: Z = 1 … A = 26.",
      "A word's value is found by writing the value of each letter. Exams ask for sums, differences or codes built from those values.",
    ],
    formulas: [{ label: "Reverse position", value: "27 − Forward position" }],
    examples: [
      { q: "Sum of the values of CAT?", steps: ["C = 3, A = 1, T = 20.", "3 + 1 + 20."], answer: "24" },
      { q: "Reverse value of D?", steps: ["D = 4.", "27 − 4 = 23."], answer: "23" },
    ],
  },
  {
    id: "opposite", level: 3, title: "Opposite Letters", topic: "opposite", visual: "opposite",
    summary: "Pairs that mirror each other: A↔Z, B↔Y … M↔N.",
    concept: [
      "Fold the alphabet in half between M and N. Letters that land on each other are opposites.",
      "Opposite letters always have positions whose sum is 27. That single rule solves every opposite question.",
      "Memory tricks: AZ, BY (by), CX, DW (dew), EV (EVe), FU, GT (GT car), HS (High School), IR (Indian Railways), JQ, KP, LO (LOve), MN.",
    ],
    formulas: [{ label: "Opposite position", value: "27 − Position" }, { label: "Check a pair", value: "Pos₁ + Pos₂ = 27" }],
    examples: [
      { q: "Opposite of H?", steps: ["H = 8.", "27 − 8 = 19.", "19 → S."], answer: "S" },
      { q: "Is K–P a pair?", steps: ["K = 11, P = 16.", "11 + 16 = 27."], answer: "Yes" },
    ],
  },
  {
    id: "position", level: 4, title: "Letter Positions", topic: "position", visual: "positions",
    summary: "Position from left, from right, and moving left/right.",
    concept: [
      "Position from the left is the normal position. Position from the right counts from Z.",
      "Moving to the right adds; moving to the left subtracts — always convert everything to left positions first.",
    ],
    formulas: [
      { label: "Right position", value: "27 − Left position" },
      { label: "Total letters", value: "Left + Right − 1" },
      { label: "Letters between", value: "Difference − 1" },
    ],
    examples: [
      { q: "P is 16th from left. Position from right?", steps: ["27 − 16 = 11."], answer: "11" },
      { q: "5th letter to the right of the 12th letter from left?", steps: ["12th = L.", "12 + 5 = 17.", "17 → Q."], answer: "Q" },
    ],
  },
  {
    id: "series", level: 5, title: "Letter Series", topic: "series", visual: "series",
    summary: "Find the rule — constant gaps, reverse gaps, alternating series.",
    concept: [
      "Convert each letter to a number and look at the differences between neighbours.",
      "If differences are not constant, split the series into alternate terms — often two series are interleaved.",
    ],
    formulas: [{ label: "Next term", value: "Last position + common gap" }],
    examples: [
      { q: "B E H K ?", steps: ["2, 5, 8, 11.", "Gap +3.", "11 + 3 = 14 → N."], answer: "N" },
      { q: "A Z B Y C X ?", steps: ["Odd terms: A B C (+1).", "Even terms: Z Y X (−1).", "Next odd term → D."], answer: "D" },
    ],
  },
  {
    id: "analogy", level: 6, title: "Letter Analogy", topic: "analogy", visual: "analogy",
    summary: "A : C :: B : ? — find the relationship, apply it again.",
    concept: ["Find how the first letter becomes the second (a gap, or an opposite), then apply exactly the same change to the third."],
    formulas: [{ label: "Gap rule", value: "Pos(2) − Pos(1) = Pos(4) − Pos(3)" }],
    examples: [
      { q: "B : E :: D : ?", steps: ["2 → 5 is +3.", "4 + 3 = 7 → G."], answer: "G" },
      { q: "C : X :: F : ?", steps: ["3 + 24 = 27 → opposites.", "Opposite of F = U."], answer: "U" },
    ],
  },
  {
    id: "coding", level: 7, title: "Coding-Decoding", topic: "coding", visual: "coding",
    summary: "Shift codes, opposite codes and number codes.",
    concept: [
      "Compare the word with its code letter by letter. Look for a constant shift (+1, −2), an opposite replacement, or position numbers.",
      "Shifts wrap around: one step after Z is A.",
    ],
    formulas: [{ label: "Shift code", value: "Code = Letter ± k" }, { label: "Opposite code", value: "Code = 27 − Position" }],
    examples: [
      { q: "CAT → DBU. DOG → ?", steps: ["C→D, A→B, T→U: +1.", "D→E, O→P, G→H."], answer: "EPH" },
      { q: "CAB = 3-1-2. BAD = ?", steps: ["Each letter → position.", "B=2, A=1, D=4."], answer: "2-1-4" },
    ],
  },
];

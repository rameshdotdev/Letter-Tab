import { encodeOpp, encodeShift, letter, opp, pos, wrap } from "@/lib/alphabet";
import type { Difficulty, Question, Topic } from "./types";
import { DIFFICULTIES, TOPICS } from "./types";

const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const WORDS = ["CAT", "DOG", "SUN", "PEN", "BOOK", "FISH", "TREE", "MILK", "GOLD", "WIND", "RAIN", "STAR", "LAMP", "DESK", "CODE", "WORD", "EXAM", "TEAM", "BRAIN", "LIGHT", "PLANT", "HOUSE", "RIVER", "TIGER"];
const sgn = (k: number) => (k >= 0 ? `+${k}` : `${k}`);
const ord = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

type Draft = Omit<Question, "id" | "topic" | "difficulty" | "options"> & { distractors: string[] };

function letterDistractors(ans: string) {
  const p = pos(ans);
  return shuffle([1, -1, 2, -2, 3, -3, 4]).map((d) => letter(wrap(p + d)));
}
function numDistractors(ans: number, min = 1) {
  return shuffle([1, -1, 2, -2, 3, 5, -5]).map((d) => ans + d).filter((n) => n >= min).map(String);
}

/* ---------- Numbering ---------- */
function numbering(d: Difficulty): Draft {
  if (d === "easy") {
    const L = letter(ri(1, 26));
    return {
      question: `What is the position of ${L} in the English alphabet?`,
      correctAnswer: String(pos(L)), distractors: numDistractors(pos(L)),
      hints: ["Count forward from A = 1.", "Use the EJOTY anchors: E=5, J=10, O=15, T=20, Y=25.", `Find the nearest anchor to ${L} and count from it.`],
      explanation: `Counting from A = 1, ${L} is at position ${pos(L)}.`,
      skill: "Forward position", estimatedTime: 10,
    };
  }
  if (d === "medium") {
    const n = ri(1, 26), L = letter(n);
    return {
      question: `Which letter is at position ${n} in the English alphabet?`,
      correctAnswer: L, distractors: letterDistractors(L),
      hints: ["Use the EJOTY anchors: E=5, J=10, O=15, T=20, Y=25.", `Pick the anchor closest to ${n}.`, `Count the remaining steps to reach ${n}.`],
      explanation: `Position ${n} corresponds to ${L}.`, skill: "Letter from position", estimatedTime: 12,
    };
  }
  if (d === "hard") {
    const w = pick(WORDS), vals = w.split("").map(pos), sum = vals.reduce((a, b) => a + b, 0);
    return {
      question: `If A = 1, B = 2, … Z = 26, what is the sum of the letter values of ${w}?`,
      correctAnswer: String(sum), distractors: numDistractors(sum),
      hints: ["Write the position of each letter.", `${w.split("").map((c) => `${c}=${pos(c)}`).join(", ")}`, "Add all the values."],
      explanation: `${w.split("").join(" + ")} = ${vals.join(" + ")} = ${sum}.`, skill: "Word value", estimatedTime: 25,
    };
  }
  const L = letter(ri(1, 26));
  return {
    question: `In reverse numbering (Z = 1, Y = 2, … A = 26), what is the value of ${L}?`,
    correctAnswer: String(27 - pos(L)), distractors: numDistractors(27 - pos(L)),
    hints: ["Reverse position = 27 − forward position.", `Forward position of ${L} is ${pos(L)}.`, `27 − ${pos(L)} = ?`],
    explanation: `Reverse value = 27 − ${pos(L)} = ${27 - pos(L)}.`, skill: "Reverse numbering", estimatedTime: 15,
  };
}

/* ---------- Opposite ---------- */
function opposite(d: Difficulty): Draft {
  if (d === "easy") {
    const L = letter(ri(1, 26)), O = opp(L);
    return {
      question: `What is the opposite letter of ${L}?`,
      correctAnswer: O, distractors: letterDistractors(O),
      hints: ["Opposite letters have positions that add up to 27.", `${L} = ${pos(L)}.`, `27 − ${pos(L)} = ${27 - pos(L)}.`],
      explanation: `${L} = ${pos(L)}; 27 − ${pos(L)} = ${27 - pos(L)} → ${O}. So ${L} ↔ ${O}.`, skill: "Opposite pair", estimatedTime: 10,
    };
  }
  if (d === "medium") {
    const n = ri(1, 26), O = letter(27 - n);
    return {
      question: `What is the opposite of the ${ord(n)} letter of the alphabet?`,
      correctAnswer: O, distractors: letterDistractors(O),
      hints: [`First find the ${ord(n)} letter: ${letter(n)}.`, "Opposite position = 27 − position.", `27 − ${n} = ${27 - n}.`],
      explanation: `${ord(n)} letter = ${letter(n)}. 27 − ${n} = ${27 - n} → ${O}.`, skill: "Position + opposite", estimatedTime: 15,
    };
  }
  if (d === "hard") {
    const a = letter(ri(1, 26)), ans = `${a}–${opp(a)}`;
    const ds: string[] = [];
    while (ds.length < 6) {
      const x = ri(1, 26), y = 27 - x + pick([1, -1, 2, -2]);
      if (y >= 1 && y <= 26 && x + y !== 27) ds.push(`${letter(x)}–${letter(y)}`);
    }
    return {
      question: "Which of the following is a correct opposite-letter pair?",
      correctAnswer: ans, distractors: ds,
      hints: ["Check if the two positions add up to 27.", "Convert each letter to its number.", `${a} = ${pos(a)} and ${opp(a)} = ${27 - pos(a)}.`],
      explanation: `${a} (${pos(a)}) + ${opp(a)} (${27 - pos(a)}) = 27, so they are opposites. The other pairs do not sum to 27.`,
      skill: "Opposite verification", estimatedTime: 20,
    };
  }
  const k = ri(2, 6), b = ri(1, 26 - k), B = letter(b), T = letter(b + k), O = opp(T);
  return {
    question: `What is the opposite of the letter which is ${k} places to the right of ${B}?`,
    correctAnswer: O, distractors: letterDistractors(O),
    hints: [`${B} = ${b}.`, `${b} + ${k} = ${b + k} → ${T}.`, `27 − ${b + k} = ${27 - b - k}.`],
    explanation: `${B} = ${b}; ${b} + ${k} = ${b + k} → ${T}; opposite = 27 − ${b + k} = ${27 - b - k} → ${O}.`,
    skill: "Multi-step opposite", estimatedTime: 25,
  };
}

/* ---------- Position ---------- */
function position(d: Difficulty): Draft {
  if (d === "easy") {
    const n = ri(1, 26), L = letter(n);
    return {
      question: `${L} is ${ord(n)} from the left end of the alphabet. What is its position from the right end?`,
      correctAnswer: String(27 - n), distractors: numDistractors(27 - n),
      hints: ["Left + Right = 27 for a 26-letter alphabet.", "Right position = 27 − Left position.", `27 − ${n} = ?`],
      explanation: `Right position = 27 − ${n} = ${27 - n}.`, skill: "Left to right", estimatedTime: 12,
    };
  }
  if (d === "medium") {
    const n = ri(1, 21), k = ri(2, 26 - n), ans = letter(n + k);
    return {
      question: `Which letter is ${ord(k)} to the right of the ${ord(n)} letter from the left?`,
      correctAnswer: ans, distractors: letterDistractors(ans),
      hints: ["Find the position of the starting letter.", `Moving right means adding: ${n} + ${k}.`, `${n} + ${k} = ${n + k}.`],
      explanation: `${ord(n)} from left = ${letter(n)}. ${n} + ${k} = ${n + k} → ${ans}.`, skill: "Move right", estimatedTime: 18,
    };
  }
  if (d === "hard") {
    const n = ri(1, 26), ans = letter(27 - n);
    return {
      question: `Which letter is ${ord(n)} from the right end of the alphabet?`,
      correctAnswer: ans, distractors: letterDistractors(ans),
      hints: ["Convert right position to left position.", "Left position = 27 − Right position.", `27 − ${n} = ${27 - n}.`],
      explanation: `Left position = 27 − ${n} = ${27 - n} → ${ans}.`, skill: "Right to letter", estimatedTime: 15,
    };
  }
  const n = ri(3, 24), p = 27 - n, k = ri(2, Math.min(8, p - 1)), ans = letter(p - k);
  return {
    question: `Which letter is ${ord(k)} to the left of the ${ord(n)} letter from the right end?`,
    correctAnswer: ans, distractors: letterDistractors(ans),
    hints: [`${ord(n)} from the right = 27 − ${n} = ${p}th from the left.`, "Moving left means subtracting.", `${p} − ${k} = ${p - k}.`],
    explanation: `${ord(n)} from right = ${p} from left (${letter(p)}). ${p} − ${k} = ${p - k} → ${ans}.`, skill: "Both sides", estimatedTime: 30,
  };
}

/* ---------- Series ---------- */
function series(d: Difficulty): Draft {
  const valid = (arr: number[]) => arr.every((x) => x >= 1 && x <= 26);
  for (let t = 0; t < 50; t++) {
    if (d === "expert") {
      const a = ri(1, 12), sa = pick([1, 2, 3]), b = ri(14, 26), sb = -pick([1, 2, 3]);
      const s1 = [0, 1, 2, 3].map((i) => a + i * sa), s2 = [0, 1, 2].map((i) => b + i * sb);
      if (!valid([...s1, ...s2])) continue;
      const shown = [s1[0], s2[0], s1[1], s2[1], s1[2], s2[2]].map(letter);
      const ans = letter(s1[3]);
      return {
        question: `Find the next term: ${shown.join(" ")} ?`, correctAnswer: ans, distractors: letterDistractors(ans),
        hints: ["Split the series into alternate positions.", `Odd terms: ${[s1[0], s1[1], s1[2]].map(letter).join(" ")}; Even terms: ${[s2[0], s2[1], s2[2]].map(letter).join(" ")}.`, `The odd terms move ${sgn(sa)} each step.`],
        explanation: `Two series interleave. Odd terms ${s1.slice(0, 3).map(letter).join(", ")} go ${sgn(sa)}; even terms go ${sgn(sb)}. Next odd term: ${s1[2]} ${sgn(sa)} = ${s1[3]} → ${ans}.`,
        skill: "Alternating series", estimatedTime: 35,
      };
    }
    const step = d === "easy" ? pick([1, 2]) : d === "medium" ? pick([2, 3, -1, -2]) : pick([3, 4, 5, -3, -4]);
    const start = ri(1, 26), n = 5, arr = Array.from({ length: n }, (_, i) => start + i * step);
    if (!valid(arr)) continue;
    const shown = arr.slice(0, 4).map(letter), ans = letter(arr[4]);
    return {
      question: `Find the next letter: ${shown.join(" ")} ?`, correctAnswer: ans, distractors: letterDistractors(ans),
      hints: ["Convert each letter to its position.", arr.slice(0, 4).join(", "), `Each step changes by ${sgn(step)}.`],
      explanation: `Positions: ${arr.slice(0, 4).join(", ")} — each term is ${sgn(step)}. ${arr[3]} ${sgn(step)} = ${arr[4]} → ${ans}.`,
      skill: step < 0 ? "Reverse series" : "Forward series", estimatedTime: d === "easy" ? 12 : d === "medium" ? 18 : 25,
    };
  }
  return series("easy");
}

/* ---------- Analogy ---------- */
function analogy(d: Difficulty): Draft {
  for (let t = 0; t < 50; t++) {
    if (d === "hard") {
      const x = letter(ri(1, 26)), y = letter(ri(1, 26));
      if (x === y) continue;
      return {
        question: `${x} : ${opp(x)} :: ${y} : ?`, correctAnswer: opp(y), distractors: letterDistractors(opp(y)),
        hints: [`Check ${pos(x)} + ${pos(opp(x))}.`, "They add to 27 — they are opposites.", `27 − ${pos(y)} = ${27 - pos(y)}.`],
        explanation: `${x} (${pos(x)}) and ${opp(x)} (${pos(opp(x))}) sum to 27 → opposites. Opposite of ${y} = 27 − ${pos(y)} = ${27 - pos(y)} → ${opp(y)}.`,
        skill: "Opposite analogy", estimatedTime: 18,
      };
    }
    if (d === "expert") {
      const k = pick([2, 3, 4, -2, -3]), a = ri(1, 25), b = ri(1, 25);
      const ps = [a, a + 1, a + k, a + 1 + k, b, b + 1, b + k, b + 1 + k];
      if (!ps.every((p) => p >= 1 && p <= 26) || a === b) continue;
      const ans = letter(b + k) + letter(b + 1 + k);
      const ds = [1, -1, 2, -2].map((e) => letter(wrap(b + k + e)) + letter(wrap(b + 1 + k + e))).concat(letter(wrap(b + k)) + letter(wrap(b + 2 + k)));
      return {
        question: `${letter(a)}${letter(a + 1)} : ${letter(a + k)}${letter(a + 1 + k)} :: ${letter(b)}${letter(b + 1)} : ?`,
        correctAnswer: ans, distractors: ds,
        hints: ["Compare each letter of the first pair individually.", `Each letter moves ${sgn(k)}.`, `Apply ${sgn(k)} to ${letter(b)} and ${letter(b + 1)}.`],
        explanation: `Each letter shifts ${sgn(k)}: ${letter(b)}→${letter(b + k)}, ${letter(b + 1)}→${letter(b + 1 + k)}. Answer ${ans}.`,
        skill: "Pair analogy", estimatedTime: 30,
      };
    }
    const k = d === "easy" ? pick([1, 2]) : pick([3, 4, 5, -2, -3]);
    const a = ri(1, 26), b = ri(1, 26);
    if (a === b || [a + k, b + k].some((p) => p < 1 || p > 26)) continue;
    const ans = letter(b + k);
    return {
      question: `${letter(a)} : ${letter(a + k)} :: ${letter(b)} : ?`, correctAnswer: ans, distractors: letterDistractors(ans),
      hints: ["Find the positions of the first pair.", `${pos(letter(a))} → ${a + k} is ${sgn(k)}.`, `${b} ${sgn(k)} = ${b + k}.`],
      explanation: `${letter(a)} (${a}) → ${letter(a + k)} (${a + k}) is ${sgn(k)}. So ${letter(b)} (${b}) ${sgn(k)} = ${b + k} → ${ans}.`,
      skill: "Letter analogy", estimatedTime: d === "easy" ? 12 : 18,
    };
  }
  return analogy("easy");
}

/* ---------- Coding ---------- */
function coding(d: Difficulty): Draft {
  let w1 = pick(WORDS), w2 = pick(WORDS);
  while (w2 === w1) w2 = pick(WORDS);
  if (d === "easy" || d === "medium") {
    const k = d === "easy" ? pick([1, -1]) : pick([2, -2, 3]);
    const ans = encodeShift(w2, k);
    return {
      question: `If ${w1} is coded as ${encodeShift(w1, k)}, how is ${w2} coded?`,
      correctAnswer: ans, distractors: [encodeShift(w2, k + 1), encodeShift(w2, k - 1), encodeShift(w2, -k), ans.split("").reverse().join("")],
      hints: [`Compare ${w1[0]} with ${encodeShift(w1, k)[0]}.`, `Every letter moves ${sgn(k)} (Z wraps back to A).`, `Apply ${sgn(k)} to each letter of ${w2}.`],
      explanation: `Each letter shifts ${sgn(k)}: ${w1.split("").map((c) => `${c}→${encodeShift(c, k)}`).join(", ")}. So ${w2} → ${ans}.`,
      skill: `Shift ${sgn(k)} coding`, estimatedTime: d === "easy" ? 20 : 25,
    };
  }
  if (d === "hard") {
    const ans = encodeOpp(w2);
    return {
      question: `If ${w1} is coded as ${encodeOpp(w1)}, how is ${w2} coded?`,
      correctAnswer: ans, distractors: [encodeShift(ans, 1), encodeShift(ans, -1), ans.split("").reverse().join(""), encodeShift(w2, 1)],
      hints: [`Check ${w1[0]} (${pos(w1[0])}) and ${opp(w1[0])} (${27 - pos(w1[0])}).`, "They add up to 27 — each letter is replaced by its opposite.", `Find the opposite of each letter of ${w2}.`],
      explanation: `Each letter is replaced by its opposite (sum 27): ${w2.split("").map((c) => `${c}→${opp(c)}`).join(", ")}. So ${w2} → ${ans}.`,
      skill: "Opposite coding", estimatedTime: 30,
    };
  }
  const code = (w: string) => w.split("").map(pos).join("-");
  const ans = code(w2);
  const vals = w2.split("").map(pos);
  return {
    question: `If ${w1} is written as ${code(w1)}, how is ${w2} written?`,
    correctAnswer: ans,
    distractors: [vals.map((v) => v + 1).join("-"), [...vals].reverse().join("-"), vals.map((v) => 27 - v).join("-"), vals.map((v, i) => (i === 0 ? v + 1 : v)).join("-")],
    hints: ["Each number is the position of a letter.", `${w1[0]} = ${pos(w1[0])}.`, `Write the position of each letter of ${w2}.`],
    explanation: `Each letter is replaced by its position: ${w2.split("").map((c) => `${c}=${pos(c)}`).join(", ")} → ${ans}.`,
    skill: "Position coding", estimatedTime: 30,
  };
}

const BUILDERS: Record<Topic, (d: Difficulty) => Draft> = { numbering, opposite, position, series, analogy, coding };

/** Deterministic validation — never show an invalid question. */
export function validate(q: Question) {
  return q.options.length === 4 && new Set(q.options).size === 4 && q.options.filter((o) => o === q.correctAnswer).length === 1;
}

let counter = 0;
export function generateQuestion(topic: Topic, difficulty: Difficulty): Question {
  for (let i = 0; i < 30; i++) {
    const d = BUILDERS[topic](difficulty);
    const distractors = [...new Set(d.distractors)].filter((x) => x !== d.correctAnswer).slice(0, 3);
    const q: Question = {
      id: `${topic}-${difficulty}-${Date.now().toString(36)}-${counter++}`,
      topic, difficulty, question: d.question, correctAnswer: d.correctAnswer,
      options: shuffle([d.correctAnswer, ...distractors]),
      explanation: d.explanation, hints: d.hints, skill: d.skill, estimatedTime: d.estimatedTime,
    };
    if (validate(q)) return q;
  }
  throw new Error("Could not generate valid question");
}

export function generateSet(opts: { topics?: Topic[]; difficulty?: Difficulty | "mixed"; count: number }): Question[] {
  const topics = opts.topics?.length ? opts.topics : TOPICS.map((t) => t.id);
  return Array.from({ length: opts.count }, () =>
    generateQuestion(pick(topics), !opts.difficulty || opts.difficulty === "mixed" ? pick(DIFFICULTIES) : opts.difficulty),
  );
}

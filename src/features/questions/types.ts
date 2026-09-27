export type Topic = "numbering" | "opposite" | "position" | "series" | "analogy" | "coding";
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface Question {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  skill: string;
  estimatedTime: number;
}

export const TOPICS: { id: Topic; label: string }[] = [
  { id: "numbering", label: "Alphabet Numbering" },
  { id: "opposite", label: "Opposite Letters" },
  { id: "position", label: "Letter Positions" },
  { id: "series", label: "Letter Series" },
  { id: "analogy", label: "Letter Analogy" },
  { id: "coding", label: "Coding-Decoding" },
];
export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
export const topicLabel = (t: string) => TOPICS.find((x) => x.id === t)?.label ?? t;

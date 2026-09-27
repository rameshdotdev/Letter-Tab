export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export const pos = (l: string) => l.toUpperCase().charCodeAt(0) - 64;
export const letter = (n: number) => String.fromCharCode(64 + n);
export const revPos = (l: string) => 27 - pos(l);
export const opp = (l: string) => letter(27 - pos(l));
export const wrap = (n: number) => ((((n - 1) % 26) + 26) % 26) + 1;
export const shift = (l: string, k: number) => letter(wrap(pos(l) + k));
export const encodeShift = (w: string, k: number) => w.split("").map((c) => shift(c, k)).join("");
export const encodeOpp = (w: string) => w.split("").map(opp).join("");
export const cleanWord = (w: string) => w.toUpperCase().replace(/[^A-Z]/g, "");

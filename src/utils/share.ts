import type { LetterState } from "./constants";

const EMOJI: Record<LetterState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛"
};

export function buildShareGrid(evals: LetterState[][]): string {
  return evals.map((row) => row.map((s) => EMOJI[s]).join("")).join("\n");
}


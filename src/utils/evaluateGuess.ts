import type { LetterState } from "./constants";
import { splitLetters } from "./normalize";

export type Evaluation = LetterState[];

/**
 * Funzione pura stile Wordle:
 * - prima marca i "correct"
 * - poi marca i "present" solo se resta una occorrenza libera nella solution
 * - tutto il resto è "absent"
 */
export function evaluateGuess(guess: string, solution: string): Evaluation {
  const g = splitLetters(guess);
  const s = splitLetters(solution);

  const out: LetterState[] = Array(g.length).fill("absent");
  const remaining = new Map<string, number>();

  // 1) correct
  for (let i = 0; i < g.length; i++) {
    if (g[i] === s[i]) {
      out[i] = "correct";
    } else {
      remaining.set(s[i], (remaining.get(s[i]) ?? 0) + 1);
    }
  }

  // 2) present
  for (let i = 0; i < g.length; i++) {
    if (out[i] === "correct") continue;
    const cnt = remaining.get(g[i]) ?? 0;
    if (cnt > 0) {
      out[i] = "present";
      remaining.set(g[i], cnt - 1);
    }
  }

  return out;
}


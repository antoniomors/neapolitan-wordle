import { MAX_GUESSES, WORD_LENGTH, type LetterState } from "../utils/constants";
import { splitLetters } from "../utils/normalize";

type Props = {
  guesses: string[];
  currentGuess: string;
  evaluations: LetterState[][];
  revealRowIndex: number | null;
};

export default function Grid({ guesses, currentGuess, evaluations, revealRowIndex }: Props) {
  const rows: { letters: string[]; states: (LetterState | null)[]; reveal: boolean }[] = [];

  for (let r = 0; r < MAX_GUESSES; r++) {
    const guess = guesses[r];
    const isSubmitted = typeof guess === "string";
    const letters = isSubmitted ? splitLetters(guess) : r === guesses.length ? splitLetters(currentGuess) : [];
    const padded = [...letters, ...Array(Math.max(0, WORD_LENGTH - letters.length)).fill("")].slice(0, WORD_LENGTH);
    const evalRow = evaluations[r] ?? [];
    const states = padded.map((_, i) => (isSubmitted ? (evalRow[i] ?? "absent") : null));
    rows.push({ letters: padded, states, reveal: revealRowIndex === r });
  }

  return (
    <div className="grid" aria-label="Griglia">
      {rows.map((row, i) => (
        <div key={i} className={`row ${row.reveal ? "reveal" : ""}`}>
          {row.letters.map((ch, j) => {
            const state = row.states[j];
            const filled = ch ? "filled" : "";
            const stateClass = state ? `state-${state}` : "";
            return (
              <div key={j} className={`tile ${filled} ${stateClass}`.trim()}>
                {ch}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}


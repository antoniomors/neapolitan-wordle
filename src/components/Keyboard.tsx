import type { LetterState } from "../utils/constants";
import { normalizeWord } from "../utils/normalize";

type KeyDef = { id: string; label: string; value: string; wide?: boolean };

type Props = {
  onKey: (value: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
};

const ROWS: KeyDef[][] = [
  "qwertyuiop".split("").map((k) => ({ id: k, label: k, value: k })),
  "asdfghjkl".split("").map((k) => ({ id: k, label: k, value: k })),
  [
    { id: "enter", label: "Invio", value: "ENTER", wide: true },
    ..."zxcvbnm".split("").map((k) => ({ id: k, label: k, value: k })),
    { id: "back", label: "⌫", value: "BACKSPACE", wide: true }
  ],
  "àèìòù".split("").map((k) => ({ id: k, label: k, value: k }))
];

export default function Keyboard({ onKey, letterStates, disabled }: Props) {
  return (
    <div className="keyboard" aria-label="Tastiera">
      {ROWS.map((row, idx) => (
        <div className="keyRow" key={idx}>
          {row.map((k) => {
            const norm = normalizeWord(k.value);
            const state = letterStates.get(norm);
            const className = `key ${k.wide ? "wide" : ""} ${state ? `state-${state}` : ""}`.trim();
            return (
              <button
                key={k.id}
                className={className}
                onClick={() => onKey(k.value)}
                disabled={disabled}
                aria-label={k.label}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}


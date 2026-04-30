import { useCallback, useEffect, useMemo, useState } from "react";
import Grid from "./components/Grid";
import HowToPlayModal from "./components/HowToPlayModal";
import Keyboard from "./components/Keyboard";
import StatsModal from "./components/StatsModal";
import Toast from "./components/Toast";
import { useDarkMode } from "./hooks/useDarkMode";
import { useGame } from "./hooks/useGame";
import { useToast } from "./hooks/useToast";
import { MAX_GUESSES, WORD_LENGTH } from "./utils/constants";
import { buildShareGrid } from "./utils/share";
import { normalizeWord, splitLetters } from "./utils/normalize";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const { theme, nextTheme, toggleTheme } = useDarkMode();
  const { message, show } = useToast(1600);

  const game = useGame();
  const [howToOpen, setHowToOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [revealRowIndex, setRevealRowIndex] = useState<number | null>(null);

  const onVirtualKey = useCallback(
    (value: string) => {
      if (value === "ENTER") {
        const res = game.submit();
        if (!res.ok) show(res.error ?? "Errore.");
        else {
          setRevealRowIndex(res.revealRowIndex ?? null);
          window.setTimeout(() => setRevealRowIndex(null), 520);
        }
        return;
      }
      if (value === "BACKSPACE") {
        game.backspace();
        return;
      }
      game.addLetter(value);
    },
    [game, show]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        onVirtualKey("ENTER");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        onVirtualKey("BACKSPACE");
        return;
      }
      const key = normalizeWord(e.key);
      const letters = splitLetters(key);
      if (letters.length === 1) onVirtualKey(letters[0]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onVirtualKey]);

  const endMessage = useMemo(() => {
    if (game.status === "won") return "Brav'! Hai vinto.";
    if (game.status === "lost") return "Peccato… hai perso.";
    return null;
  }, [game.status]);

  const shareText = useMemo(() => {
    const header =
      game.status === "won"
        ? `Wordle Napoletano ${game.dateId} ${game.guesses.length}/${MAX_GUESSES}`
        : `Wordle Napoletano ${game.dateId} X/${MAX_GUESSES}`;
    return `${header}\n\n${buildShareGrid(game.evaluations)}`;
  }, [game.dateId, game.evaluations, game.guesses.length, game.status]);

  const onShare = useCallback(async () => {
    const ok = await copyToClipboard(shareText);
    show(ok ? "Risultato copiato." : "Nun riesco a copiare.");
  }, [shareText, show]);

  const remaining = WORD_LENGTH - splitLetters(game.currentGuess).length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">WORDLE NAP</div>
        <div className="topbarActions">
          <button className="iconBtn" onClick={() => setHowToOpen(true)} aria-label="Istruzioni">
            ?
          </button>
          <button className="iconBtn" onClick={() => setStatsOpen(true)} aria-label="Statistiche">
            ★
          </button>
          <button className="iconBtn" onClick={toggleTheme} aria-label={`Tema: passa a ${nextTheme}`}>
            {theme === "dark" ? "☾" : "☀"}
          </button>
        </div>
      </header>

      <main className="container">
        <Grid
          guesses={game.guesses}
          currentGuess={game.currentGuess}
          evaluations={game.evaluations}
          revealRowIndex={revealRowIndex}
        />

        <div className="footerBar" style={{ width: "100%", maxWidth: 520 }}>
          <div className="mutedText">
            {game.status === "playing"
              ? remaining > 0
                ? `Ancora ${remaining}…`
                : "ENTER pe' confermà"
              : `${endMessage} Parola: ${game.solution.toUpperCase()}`}
          </div>
          <button className="primaryBtn" onClick={onShare} disabled={game.status === "playing"}>
            Condivide
          </button>
        </div>

        <Keyboard onKey={onVirtualKey} letterStates={game.keyboardState} disabled={!game.canType} />
      </main>

      <HowToPlayModal open={howToOpen} onClose={() => setHowToOpen(false)} />
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
      <Toast message={message} />
    </div>
  );
}


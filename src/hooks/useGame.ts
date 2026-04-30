import { useEffect, useMemo, useState } from "react";
import { SOLUTIONS, VALID_WORDS } from "../../data/words.js";
import { MAX_GUESSES, STORAGE_KEYS, WORD_LENGTH, type LetterState } from "../utils/constants";
import { getLocalDateId, pickDailyIndex } from "../utils/date";
import { evaluateGuess } from "../utils/evaluateGuess";
import { normalizeWord, splitLetters } from "../utils/normalize";
import { safeJsonParse, safeJsonStringify } from "../utils/storage";

type GameStatus = "playing" | "won" | "lost";

type PersistedGame = {
  dateId: string;
  solution: string;
  guesses: string[];
  currentGuess: string;
  status: GameStatus;
  // serve per evitare doppio update statistiche se ricarichi la pagina
  statsUpdated?: boolean;
};

type Stats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[]; // index 0..5 = win in 1..6
  lastPlayedDateId?: string;
};

const normalizedSolutions = SOLUTIONS.map(normalizeWord).filter((w) => splitLetters(w).length === WORD_LENGTH);
const validSet = new Set(
  VALID_WORDS.map(normalizeWord).filter((w) => splitLetters(w).length === WORD_LENGTH)
);

const letterRank: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

function loadStats(): Stats {
  const raw = safeJsonParse<Stats>(localStorage.getItem(STORAGE_KEYS.stats));
  if (!raw || !Array.isArray(raw.distribution) || raw.distribution.length !== MAX_GUESSES) {
    return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: Array(MAX_GUESSES).fill(0) };
  }
  return raw;
}

function saveStats(s: Stats) {
  localStorage.setItem(STORAGE_KEYS.stats, safeJsonStringify(s));
}

function pickSolution(dateId: string): string {
  const idx = pickDailyIndex(dateId, normalizedSolutions.length);
  return normalizedSolutions[idx] ?? normalizedSolutions[0] ?? "caffè";
}

export function useGame() {
  const dateId = getLocalDateId();
  const dailySolution = useMemo(() => pickSolution(dateId), [dateId]);

  const [state, setState] = useState<PersistedGame>(() => {
    const saved = safeJsonParse<PersistedGame>(localStorage.getItem(STORAGE_KEYS.game));
    if (saved?.dateId === dateId) {
      return {
        dateId,
        solution: normalizeWord(saved.solution ?? dailySolution),
        guesses: (saved.guesses ?? []).map(normalizeWord),
        currentGuess: normalizeWord(saved.currentGuess ?? ""),
        status: saved.status ?? "playing",
        statsUpdated: saved.statsUpdated ?? false
      };
    }
    return { dateId, solution: dailySolution, guesses: [], currentGuess: "", status: "playing", statsUpdated: false };
  });

  const evaluations = useMemo(
    () => state.guesses.map((g) => evaluateGuess(g, state.solution)),
    [state.guesses, state.solution]
  );

  const isComplete = state.status !== "playing";
  const canType = !isComplete && state.guesses.length < MAX_GUESSES;

  const keyboardState = useMemo(() => {
    const m = new Map<string, LetterState>();
    for (let i = 0; i < state.guesses.length; i++) {
      const letters = splitLetters(state.guesses[i]);
      const evalRow = evaluations[i] ?? [];
      for (let j = 0; j < letters.length; j++) {
        const prev = m.get(letters[j]);
        const next = evalRow[j];
        if (!next) continue;
        if (!prev || letterRank[next] > letterRank[prev]) m.set(letters[j], next);
      }
    }
    return m;
  }, [state.guesses, evaluations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.game, safeJsonStringify(state));
  }, [state]);

  const addLetter = (raw: string) => {
    if (!canType) return;
    const ch = normalizeWord(raw);
    if (!ch) return;
    const letters = splitLetters(state.currentGuess);
    const nextLetters = splitLetters(ch);
    if (nextLetters.length !== 1) return;
    if (letters.length >= WORD_LENGTH) return;
    setState((s) => ({ ...s, currentGuess: normalizeWord(s.currentGuess + nextLetters[0]) }));
  };

  const backspace = () => {
    if (!canType) return;
    setState((s) => {
      const letters = splitLetters(s.currentGuess);
      letters.pop();
      return { ...s, currentGuess: letters.join("") };
    });
  };

  const submit = (): { ok: boolean; error?: string; revealRowIndex?: number } => {
    if (!canType) return { ok: false, error: "Partita finita." };
    const guess = normalizeWord(state.currentGuess);
    if (splitLetters(guess).length !== WORD_LENGTH) return { ok: false, error: "Te servono 5 lettere." };
    if (!validSet.has(guess)) return { ok: false, error: "Parola nun valida." };

    const nextGuesses = [...state.guesses, guess];
    const won = guess === state.solution;
    const lost = !won && nextGuesses.length >= MAX_GUESSES;
    const status: GameStatus = won ? "won" : lost ? "lost" : "playing";

    setState((s) => ({
      ...s,
      guesses: nextGuesses,
      currentGuess: "",
      status
    }));

    return { ok: true, revealRowIndex: nextGuesses.length - 1 };
  };

  const ensureStatsUpdated = () => {
    setState((s) => {
      if (s.statsUpdated) return s;
      if (s.status === "playing") return s;

      const stats = loadStats();
      const alreadyCounted = stats.lastPlayedDateId === s.dateId;
      if (alreadyCounted) return { ...s, statsUpdated: true };

      const played = stats.played + 1;
      const won = s.status === "won";
      const wins = stats.wins + (won ? 1 : 0);

      let currentStreak = stats.currentStreak;
      let maxStreak = stats.maxStreak;

      if (won) {
        currentStreak = currentStreak + 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }

      const distribution = [...stats.distribution];
      if (won) {
        const attempt = s.guesses.length; // 1..6
        if (attempt >= 1 && attempt <= MAX_GUESSES) distribution[attempt - 1] = (distribution[attempt - 1] ?? 0) + 1;
      }

      saveStats({
        played,
        wins,
        currentStreak,
        maxStreak,
        distribution,
        lastPlayedDateId: s.dateId
      });

      return { ...s, statsUpdated: true };
    });
  };

  useEffect(() => {
    ensureStatsUpdated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const resetForToday = () => {
    // Non esposto nella UI: per requisito, niente replay nello stesso giorno.
    setState({ dateId, solution: dailySolution, guesses: [], currentGuess: "", status: "playing", statsUpdated: false });
  };

  return {
    dateId,
    solution: state.solution,
    guesses: state.guesses,
    currentGuess: state.currentGuess,
    status: state.status,
    evaluations,
    keyboardState,
    canType,
    addLetter,
    backspace,
    submit,
    resetForToday
  };
}

export type { GameStatus, Stats };


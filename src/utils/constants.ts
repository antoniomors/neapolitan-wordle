export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const STORAGE_KEYS = {
  game: "wn_game_v1",
  stats: "wn_stats_v1",
  theme: "wn_theme_v1"
} as const;

export type LetterState = "correct" | "present" | "absent";


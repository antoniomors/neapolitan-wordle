/**
 * Normalizza input utente / dizionario:
 * - lowercase
 * - trim
 * - NFC (evita problemi con accenti composti)
 */
export function normalizeWord(raw: string): string {
  return raw.trim().toLowerCase().normalize("NFC");
}

export function splitLetters(word: string): string[] {
  // Per semplicità assumiamo 1 codepoint = 1 lettera (va bene per àèìòù ecc.).
  // Se in futuro inserisci emoji/legature, qui servirà un grapheme splitter.
  return Array.from(word.normalize("NFC"));
}


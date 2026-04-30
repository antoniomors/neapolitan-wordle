export function getLocalDateId(d = new Date()): string {
  // YYYY-MM-DD in locale time (non UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysSinceEpochLocal(dateId: string): number {
  const [y, m, d] = dateId.split("-").map((x) => Number(x));
  const dt = new Date(y, m - 1, d);
  const epoch = new Date(1970, 0, 1);
  const ms = dt.getTime() - epoch.getTime();
  return Math.floor(ms / 86_400_000);
}

function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (const ch of str) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickDailyIndex(dateId: string, modulo: number): number {
  // Deterministico e “mescola” meglio di un semplice timestamp%N.
  const h = fnv1a32(dateId);
  return modulo <= 0 ? 0 : h % modulo;
}


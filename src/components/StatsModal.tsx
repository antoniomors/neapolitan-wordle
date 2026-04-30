import { useMemo } from "react";
import { MAX_GUESSES, STORAGE_KEYS } from "../utils/constants";
import { safeJsonParse } from "../utils/storage";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Stats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
};

function loadStats(): Stats {
  const raw = safeJsonParse<Stats>(localStorage.getItem(STORAGE_KEYS.stats));
  if (!raw || !Array.isArray(raw.distribution)) {
    return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: Array(MAX_GUESSES).fill(0) };
  }
  return {
    played: raw.played ?? 0,
    wins: raw.wins ?? 0,
    currentStreak: raw.currentStreak ?? 0,
    maxStreak: raw.maxStreak ?? 0,
    distribution: raw.distribution.length === MAX_GUESSES ? raw.distribution : Array(MAX_GUESSES).fill(0)
  };
}

export default function StatsModal({ open, onClose }: Props) {
  const stats = useMemo(() => loadStats(), [open]);
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <Modal title="Statistiche" open={open} onClose={onClose}>
      <div className="statsGrid">
        <div className="stat">
          <div className="statValue">{stats.played}</div>
          <div className="statLabel">Partite</div>
        </div>
        <div className="stat">
          <div className="statValue">{winRate}%</div>
          <div className="statLabel">Vittorie</div>
        </div>
        <div className="stat">
          <div className="statValue">{stats.currentStreak}</div>
          <div className="statLabel">Streak</div>
        </div>
        <div className="stat">
          <div className="statValue">{stats.maxStreak}</div>
          <div className="statLabel">Max streak</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="mutedText">Distribuzione vittorie</div>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {stats.distribution.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="pill" style={{ width: 34, textAlign: "center" }}>
                {i + 1}
              </div>
              <div
                style={{
                  height: 12,
                  width: `${Math.max(6, Math.min(100, v * 12))}%`,
                  background: "var(--fg)",
                  borderRadius: 999
                }}
              />
              <div className="mutedText">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}


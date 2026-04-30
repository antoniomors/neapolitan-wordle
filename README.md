## Wordle Napoletano (React + Vite + TS)

Gioco web ispirato a Wordle, **tutto client-side**, con parola del giorno, dizionario napoletano locale, persistenza in `localStorage`, tastiera fisica + virtuale, dark mode e condivisione risultato.

### Requisiti
- Node.js 18+ (consigliato 20+)

### Avvio
```bash
npm install
npm run dev
```

### Build / Preview
```bash
npm run build
npm run preview
```

### Struttura
- `src/components/` – UI (griglia, tastiera, modali)
- `src/hooks/` – stato e side effects (game, toast, dark mode)
- `src/utils/` – logica pura (valutazione guess/solution, data, share, normalizzazione)
- `data/words.js` – dizionario locale (parole valide + soluzioni)

### Dizionario
Modifica `data/words.js` aggiungendo parole **di 5 lettere** (in minuscolo). Gli accenti sono supportati (es. `caffè`, `jammò`).


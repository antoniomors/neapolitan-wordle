import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function HowToPlayModal({ open, onClose }: Props) {
  return (
    <Modal title="Comm' s' gioca" open={open} onClose={onClose}>
      <p className="mutedText">
        Truvà a parola segreta (5 lettere) int'a 6 pruvate.
      </p>
      <div className="pillRow">
        <span className="pill">🟩 Lettera giusta e posto giusto</span>
        <span className="pill">🟨 Lettera presente ma posto sbagliato</span>
        <span className="pill">⬛ Lettera assente</span>
      </div>
      <p className="mutedText" style={{ marginTop: 12 }}>
        Può scrivere cu a tastiera fisica o chilla a schermo. Invio cu ENTER, cancella cu BACKSPACE.
      </p>
    </Modal>
  );
}


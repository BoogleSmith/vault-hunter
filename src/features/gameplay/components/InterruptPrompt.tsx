interface InterruptPromptProps {
  title: string;
  message: string;
  onDismiss: () => void;
}

export function InterruptPrompt({
  title,
  message,
  onDismiss,
}: InterruptPromptProps) {
  return (
    <div className="interrupt-overlay" role="alertdialog" aria-modal="true">
      <section className="interrupt-modal">
        <p className="interrupt-kicker">Attention</p>
        <h2>{title}</h2>
        <p>{message}</p>
        <button className="interrupt-dismiss" onClick={onDismiss}>
          Continue
        </button>
      </section>
    </div>
  );
}

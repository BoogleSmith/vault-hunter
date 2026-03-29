import { useEffect, useRef } from "react";

interface AdventureLogPanelProps {
  log: string[];
}

export function AdventureLogPanel({ log }: AdventureLogPanelProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <section className="panel log">
      <h2>Adventure Log</h2>
      <div className="log-lines" ref={logRef}>
        {log.slice(-18).map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </section>
  );
}

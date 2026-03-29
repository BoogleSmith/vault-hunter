import { useEffect, useRef, useState } from "react";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./DebugMenu.css";

const SECRET_SEQUENCE = "debug";

interface DebugMenuProps {
  canForceOutcome: boolean;
  showEnemyDebug: boolean;
  onToggleEnemyDebug: () => void;
  onForceVictory: () => void;
  onForceDeath: () => void;
}

export function DebugMenu({
  canForceOutcome,
  showEnemyDebug,
  onToggleEnemyDebug,
  onForceVictory,
  onForceDeath,
}: DebugMenuProps) {
  const [open, setOpen] = useState(false);
  const bufferRef = useRef("");
  const clearTimerRef = useRef<number | null>(null);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        bufferRef.current = "";
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key.length !== 1) {
        return;
      }

      const key = event.key.toLowerCase();
      bufferRef.current = (bufferRef.current + key).slice(
        -SECRET_SEQUENCE.length,
      );

      if (bufferRef.current === SECRET_SEQUENCE) {
        setOpen((current) => !current);
        bufferRef.current = "";
      }

      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
      }
      clearTimerRef.current = window.setTimeout(() => {
        bufferRef.current = "";
      }, 1200);
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="debug-menu-root">
      <button
        className="debug-hotspot"
        aria-label={open ? "Close debug menu" : "Open debug menu"}
        title="Debug"
        onClick={() => setOpen((current) => !current)}
      >
        ?
      </button>

      {open && (
        <aside
          className="panel debug-menu-panel"
          role="dialog"
          aria-label="Debug menu"
        >
          <p className="debug-menu-kicker">Debug Menu</p>
          <p className="debug-menu-hint">Type DEBUG to toggle this menu.</p>

          <label className="debug-menu-option">
            <input
              type="checkbox"
              checked={showEnemyDebug}
              onChange={onToggleEnemyDebug}
            />
            <span>Show enemy positions</span>
          </label>

          <div className="debug-menu-actions">
            <button onClick={onForceVictory} disabled={!canForceOutcome}>
              Trigger Victory
            </button>
            <button
              className="ghost"
              onClick={onForceDeath}
              disabled={!canForceOutcome}
            >
              Trigger Death
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

import { type DirectionKey } from "../../../../game/data";
import "./MovementControls.css";

const DPAD: { key: DirectionKey; label: string; col: number; row: number }[] = [
  { key: "UP", label: "↑", col: 2, row: 1 },
  { key: "LEFT", label: "←", col: 1, row: 2 },
  { key: "RIGHT", label: "→", col: 3, row: 2 },
  { key: "DOWN", label: "↓", col: 2, row: 3 },
];

interface MovementControlsProps {
  isPlaying: boolean;
  availableDirections: Record<DirectionKey, boolean>;
  onMove: (direction: DirectionKey) => void;
  onWait: () => void;
  onOpenMap: () => void;
}

export function MovementControls({
  isPlaying,
  availableDirections,
  onMove,
  onWait,
  onOpenMap,
}: MovementControlsProps) {
  return (
    <div className="actions" aria-label="Movement controls">
      <p className="actions-label">Move</p>
      <div className="dpad">
        {DPAD.map(({ key, label, col, row }) => (
          <button
            key={key}
            style={{ gridColumn: col, gridRow: row }}
            onClick={() => onMove(key)}
            disabled={!availableDirections[key] || !isPlaying}
          >
            {label}
          </button>
        ))}
        <button
          className="ghost"
          style={{ gridColumn: 2, gridRow: 2 }}
          onClick={onWait}
          disabled={!isPlaying}
          aria-label="Wait"
          title="Wait"
        >
          ⏳
        </button>
      </div>
      <button className="ghost map-open-btn" onClick={onOpenMap}>
        🗺️
      </button>
    </div>
  );
}

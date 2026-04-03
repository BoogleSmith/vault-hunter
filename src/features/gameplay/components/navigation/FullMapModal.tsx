import { type Game } from "../../../../game/engine";
import { ExpandedMap } from "./ExpandedMap";
import "./FullMapModal.css";

interface FullMapModalProps {
  game: Game;
  showEnemyDebug: boolean;
  onClose: () => void;
}

export function FullMapModal({
  game,
  showEnemyDebug,
  onClose,
}: FullMapModalProps) {
  return (
    <div className="map-overlay" onClick={onClose}>
      <div
        className="panel map-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Full map"
      >
        <div className="map-modal-header">
          <h3>Full Map</h3>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <ExpandedMap game={game} showEnemyDebug={showEnemyDebug} />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { type DirectionKey } from "../../../../game/data";
import { type Game } from "../../../../game/engine";
import "../../../shared/components/controls.css";
import "../../../shared/components/surface.css";
import "./ExplorePanel.css";
import { FullMapModal } from "./FullMapModal";
import { LocalMapView } from "./LocalMapView";
import { MovementControls } from "./MovementControls";
import { buildLocalRows } from "./exploreMapUtils";

interface ExplorePanelProps {
  game: Game;
  availableDirections: Record<DirectionKey, boolean>;
  onMove: (direction: DirectionKey) => void;
  onWait: () => void;
  showEnemyDebug: boolean;
}

export function ExplorePanel({
  game,
  availableDirections,
  onMove,
  onWait,
  showEnemyDebug,
}: ExplorePanelProps) {
  const [showFullMap, setShowFullMap] = useState(false);
  const isPlaying = game.status === "playing";

  const localRows = useMemo(() => buildLocalRows(game), [game]);

  return (
    <section className="panel explore-panel">
      <div className="explore-layout">
        <MovementControls
          isPlaying={isPlaying}
          availableDirections={availableDirections}
          onMove={onMove}
          onWait={onWait}
          onOpenMap={() => setShowFullMap(true)}
        />

        <LocalMapView
          game={game}
          localRows={localRows}
          showEnemyDebug={showEnemyDebug}
        />
      </div>

      {showFullMap ? (
        <FullMapModal
          game={game}
          showEnemyDebug={showEnemyDebug}
          onClose={() => setShowFullMap(false)}
        />
      ) : null}
    </section>
  );
}

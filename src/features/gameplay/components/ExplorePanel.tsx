import { useMemo, useState } from "react";
import { type DirectionKey } from "../../../game/data";
import { getRoomMeta, type Game, type Room } from "../../../game/engine";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./ExplorePanel.css";
import { ExpandedMap } from "./ExpandedMap";

const DPAD: { key: DirectionKey; label: string; col: number; row: number }[] = [
  { key: "UP", label: "↑", col: 2, row: 1 },
  { key: "LEFT", label: "←", col: 1, row: 2 },
  { key: "RIGHT", label: "→", col: 3, row: 2 },
  { key: "DOWN", label: "↓", col: 2, row: 3 },
];

const LOCAL_MAP_RADIUS = 2;

function toRoomName(key: string): string {
  return `${key.charAt(0)}${key.slice(1).toLowerCase()}`;
}

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

  const localRows = useMemo(() => {
    const rows: Array<Array<{ room: Room | undefined; x: number; y: number }>> =
      [];

    for (
      let y = game.currentY - LOCAL_MAP_RADIUS;
      y <= game.currentY + LOCAL_MAP_RADIUS;
      y++
    ) {
      const row: Array<{ room: Room | undefined; x: number; y: number }> = [];
      for (
        let x = game.currentX - LOCAL_MAP_RADIUS;
        x <= game.currentX + LOCAL_MAP_RADIUS;
        x++
      ) {
        row.push({ room: game.map[y]?.[x], x, y });
      }
      rows.push(row);
    }

    return rows;
  }, [game.currentX, game.currentY, game.map]);

  return (
    <section className="panel explore-panel">
      <div className="explore-layout">
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
          <button
            className="ghost map-open-btn"
            onClick={() => setShowFullMap(true)}
          >
            🗺️
          </button>
        </div>

        <div className="map-column">
          <div className="map map--local" role="region" aria-label="Nearby map">
            {localRows.map((row, rowIdx) => (
              <div className="map-row map-row--local" key={`local-${rowIdx}`}>
                {row.map(({ room, x, y }) => {
                  const isCurrent = x === game.currentX && y === game.currentY;
                  const hasEnemy = !!room && showEnemyDebug && room.enemy.alive;
                  const isVisible = !!room && (isCurrent || room.discovered || hasEnemy);
                  const tileClasses = [
                    "tile",
                    "tile--local",
                    isCurrent ? "current" : "",
                    hasEnemy ? "enemy" : "",
                    room ? "" : "tile--void",
                    room && !isVisible ? "tile--hidden" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div className={tileClasses} key={`local-${x}-${y}`}>
                      {room ? (
                        isVisible ? (
                        <>
                          <span className="tile-symbol" aria-hidden="true">
                            {isCurrent
                              ? "🧍"
                              : hasEnemy
                                ? "⚠"
                                : getRoomMeta(room).tile}
                          </span>
                          <span className="tile-name">
                            {toRoomName(getRoomMeta(room).key)}
                          </span>
                        </>
                        ) : null
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFullMap && (
        <div className="map-overlay" onClick={() => setShowFullMap(false)}>
          <div
            className="panel map-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Full map"
          >
            <div className="map-modal-header">
              <h3>Full Map</h3>
              <button className="ghost" onClick={() => setShowFullMap(false)}>
                Close
              </button>
            </div>
            <ExpandedMap game={game} showEnemyDebug={showEnemyDebug} />
          </div>
        </div>
      )}
    </section>
  );
}

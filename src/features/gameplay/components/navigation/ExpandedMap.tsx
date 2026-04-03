import { getRoomMeta, type Game } from "../../../../game/engine";
import "./ExpandedMap.css";

function toRoomName(key: string): string {
  return `${key.charAt(0)}${key.slice(1).toLowerCase()}`;
}

interface ExpandedMapProps {
  game: Game;
  showEnemyDebug: boolean;
}

export function ExpandedMap({ game, showEnemyDebug }: ExpandedMapProps) {
  return (
    <div
      className="expanded-map-grid"
      role="region"
      aria-label="Full map grid"
      style={{
        gridTemplateColumns: `repeat(${game.width}, var(--expanded-map-cell))`,
      }}
    >
      {game.map.flatMap((row, y) =>
        row.map((room, x) => {
          const isCurrent = x === game.currentX && y === game.currentY;
          const hasEnemy = showEnemyDebug && room.enemy.alive;
          const isVisible = isCurrent || room.discovered || hasEnemy;

          return (
            <div
              className={`expanded-map-tile ${isCurrent ? "current" : ""} ${hasEnemy ? "enemy" : ""} ${!isVisible ? "hidden" : ""}`}
              key={`expanded-${x}-${y}`}
              title={
                isVisible ? toRoomName(getRoomMeta(room).key) : "Undiscovered"
              }
            >
              {isVisible && (
                <>
                  <span className="expanded-map-symbol" aria-hidden="true">
                    {isCurrent ? "🧍" : hasEnemy ? "⚠" : getRoomMeta(room).tile}
                  </span>
                  <span className="expanded-map-name">
                    {toRoomName(getRoomMeta(room).key)}
                  </span>
                </>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}

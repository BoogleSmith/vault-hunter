import { type DirectionKey } from "../../../game/data";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./RoomPanel.css";
import { EncounterPanel } from "./EncounterPanel";

const DPAD: { key: DirectionKey; label: string; col: number; row: number }[] = [
  { key: "UP", label: "↑", col: 2, row: 1 },
  { key: "LEFT", label: "←", col: 1, row: 2 },
  { key: "RIGHT", label: "→", col: 3, row: 2 },
  { key: "DOWN", label: "↓", col: 2, row: 3 },
];
import { getRoomMeta, type Game, type Room } from "../../../game/engine";

interface RoomPanelProps {
  game: Game;
  currentRoom: Room;
  availableDirections: Record<DirectionKey, boolean>;
  inEncounter: boolean;
  onMove: (direction: DirectionKey) => void;
  onWait: () => void;
  onAttack: () => void;
  onFlee: () => void;
  showEnemyDebug: boolean;
}

export function RoomPanel({
  game,
  currentRoom,
  availableDirections,
  inEncounter,
  onMove,
  onWait,
  onAttack,
  onFlee,
  showEnemyDebug,
}: RoomPanelProps) {
  const roomMeta = getRoomMeta(currentRoom);
  const isPlaying = game.status === "playing";

  return (
    <section className="panel room">
      <h2>{roomMeta.key}</h2>
      <p>{roomMeta.description}</p>

      {inEncounter && currentRoom.enemy.alive && (
        <EncounterPanel
          enemy={currentRoom.enemy}
          onAttack={onAttack}
          onFlee={onFlee}
          isPlaying={isPlaying}
        />
      )}

      {!inEncounter && (
        <div className="actions">
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
        </div>
      )}

      {!inEncounter && (
        <div className="map">
          {game.map.map((row, y) => (
            <div className="map-row" key={y}>
              {row.map((room, x) => {
                const isCurrent = x === game.currentX && y === game.currentY;
                const hasEnemy = showEnemyDebug && room.enemy.alive;
                const label = isCurrent
                  ? "X"
                  : room.discovered || hasEnemy
                    ? getRoomMeta(room).tile
                    : " ";

                return (
                  <span
                    className={`tile ${isCurrent ? "current" : ""} ${hasEnemy ? "enemy" : ""}`}
                    key={`${x}-${y}`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

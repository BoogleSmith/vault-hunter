import { type DirectionKey } from "../../../game/data";
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

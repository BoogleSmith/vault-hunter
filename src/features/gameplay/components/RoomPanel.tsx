import { type DirectionKey } from "../../../game/data";

const DPAD: { key: DirectionKey; label: string; col: number; row: number }[] = [
  { key: "UP",    label: "↑",  col: 2, row: 1 },
  { key: "LEFT",  label: "←",  col: 1, row: 2 },
  { key: "RIGHT", label: "→",  col: 3, row: 2 },
  { key: "DOWN",  label: "↓",  col: 2, row: 3 },
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
}

export function RoomPanel({
  game,
  currentRoom,
  availableDirections,
  inEncounter,
  onMove,
  onAttack,
  onFlee,
}: RoomPanelProps) {
  const roomMeta = getRoomMeta(currentRoom);

  return (
    <section className="panel room">
      <h2>{roomMeta.key}</h2>
      <p>{roomMeta.description}</p>

      <div className="actions">
        <p className="actions-label">Move</p>
        <div className="dpad">
          {DPAD.map(({ key, label, col, row }) => (
            <button
              key={key}
              style={{ gridColumn: col, gridRow: row }}
              onClick={() => onMove(key)}
              disabled={
                !availableDirections[key] ||
                inEncounter ||
                game.status !== "playing"
              }
            >
              {label}
            </button>
          ))}
        </div>

        <p className="actions-label">Combat</p>
        <div className="combat-actions">
          <button
            onClick={onAttack}
            disabled={!inEncounter || game.status !== "playing"}
          >
            ⚔ Attack
          </button>
          <button
            className="ghost"
            onClick={onFlee}
            disabled={!inEncounter || game.status !== "playing"}
          >
            🏃 Flee
          </button>
        </div>
      </div>

      <div className="map">
        {game.map.map((row, y) => (
          <div className="map-row" key={y}>
            {row.map((room, x) => {
              const isCurrent = x === game.currentX && y === game.currentY;
              const label = isCurrent
                ? "X"
                : room.discovered
                  ? getRoomMeta(room).tile
                  : " ";

              return (
                <span
                  className={`tile ${isCurrent ? "current" : ""}`}
                  key={`${x}-${y}`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

import { getRoomMeta, type Game, type Room } from "../../../../game/engine";

const LOCAL_MAP_RADIUS = 2;

export type LocalMapCell = { room: Room | undefined; x: number; y: number };
export type LocalMapRow = LocalMapCell[];

function toRoomName(key: string): string {
  return `${key.charAt(0)}${key.slice(1).toLowerCase()}`;
}

export function buildLocalRows(game: Game): LocalMapRow[] {
  const rows: LocalMapRow[] = [];

  for (
    let y = game.currentY - LOCAL_MAP_RADIUS;
    y <= game.currentY + LOCAL_MAP_RADIUS;
    y++
  ) {
    const row: LocalMapRow = [];
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
}

export interface LocalTileViewModel {
  className: string;
  isVisible: boolean;
  symbol: string;
  name: string;
}

export function getLocalTileViewModel({
  room,
  x,
  y,
  game,
  showEnemyDebug,
}: {
  room: Room | undefined;
  x: number;
  y: number;
  game: Game;
  showEnemyDebug: boolean;
}): LocalTileViewModel {
  const isCurrent = x === game.currentX && y === game.currentY;
  const hasEnemy = !!room && showEnemyDebug && room.enemy.alive;
  const isVisible = !!room && (isCurrent || room.discovered || hasEnemy);
  const meta = room ? getRoomMeta(room) : null;
  const className = [
    "tile",
    "tile--local",
    isCurrent ? "current" : "",
    hasEnemy ? "enemy" : "",
    room ? "" : "tile--void",
    room && !isVisible ? "tile--hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    className,
    isVisible,
    symbol: isCurrent ? "🧍" : hasEnemy ? "⚠" : (meta?.tile ?? ""),
    name: meta ? toRoomName(meta.key) : "",
  };
}

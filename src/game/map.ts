import {
  DIFFICULTIES,
  DIRECTIONS,
  ROOM_TYPES,
  enemyFromTemplate,
} from "./data";
import { addHealth, nextInt } from "./mechanics";
import type {
  DifficultyKey,
  DirectionKey,
  Game,
  Player,
  Room,
  RoomTypeKey,
  RoomTypeMeta,
} from "./types";

const ROOM_BY_KEY: Record<RoomTypeKey, RoomTypeMeta> = Object.fromEntries(
  ROOM_TYPES.map((room) => [room.key, room]),
) as Record<RoomTypeKey, RoomTypeMeta>;

const RANDOM_ROOM_POOL = ROOM_TYPES.filter(
  (room) => room.key !== "FOYER" && room.key !== "VAULT",
);

function roomFromType(
  typeKey: RoomTypeKey,
  x: number,
  y: number,
  discovered = false,
  alwaysSpawnEnemy = false,
): Room {
  const type = ROOM_BY_KEY[typeKey];
  const enemy =
    alwaysSpawnEnemy || Math.random() >= 0.5
      ? enemyFromTemplate(type.enemy)
      : enemyFromTemplate("EMPTY");

  return {
    x,
    y,
    typeKey,
    discovered,
    enemy,
  };
}

function pickRandomRoomType(): RoomTypeKey {
  const idx = nextInt(0, RANDOM_ROOM_POOL.length - 1);
  const room = RANDOM_ROOM_POOL[idx];
  if (!room) {
    return "CATACOMBS";
  }
  return room.key;
}

export function createGame({
  difficultyKey,
  player,
}: {
  difficultyKey: DifficultyKey;
  player: Player;
}): Game {
  const difficulty = DIFFICULTIES[difficultyKey];
  const width = difficulty.width;
  const height = difficulty.height;

  const startX = 0;
  const startY = Math.floor(height / 2);
  const vaultX = nextInt(Math.ceil(width / 2), width - 1);
  const vaultY = nextInt(0, height - 1);

  const map: Room[][] = Array.from({ length: height }, (_, y) => {
    return Array.from({ length: width }, (_, x) => {
      if (x === startX && y === startY) {
        return roomFromType("FOYER", x, y, true, true);
      }
      if (x === vaultX && y === vaultY) {
        return roomFromType("VAULT", x, y, false, true);
      }
      return roomFromType(pickRandomRoomType(), x, y);
    });
  });

  const startRoom = map[startY]?.[startX];
  if (!startRoom) {
    throw new Error("Unable to initialize starting room.");
  }

  return {
    difficultyKey,
    width,
    height,
    currentX: startX,
    currentY: startY,
    map,
    player,
    log: [
      "---- Welcome to Vault Hunter ----",
      `${startRoom.typeKey}: ${ROOM_BY_KEY[startRoom.typeKey].description}`,
      "Find the vault and slay the drake.",
    ],
    status: "playing",
  };
}

export function getCurrentRoom(game: Game): Room {
  const room = game.map[game.currentY]?.[game.currentX];
  if (!room) {
    throw new Error("Current room is out of bounds.");
  }
  return room;
}

export function getRoomMeta(room: Room): RoomTypeMeta {
  return ROOM_BY_KEY[room.typeKey];
}

export function getAvailableDirections(
  game: Game,
): Record<DirectionKey, boolean> {
  const result: Record<DirectionKey, boolean> = {
    RIGHT: false,
    DOWN: false,
    LEFT: false,
    UP: false,
  };

  (
    Object.entries(DIRECTIONS) as [
      DirectionKey,
      (typeof DIRECTIONS)[DirectionKey],
    ][]
  ).forEach(([key, dir]) => {
    const x = game.currentX + dir.dx;
    const y = game.currentY + dir.dy;
    result[key] = x >= 0 && y >= 0 && x < game.width && y < game.height;
  });

  return result;
}

export function movePlayer(game: Game, directionKey: DirectionKey): void {
  const dir = DIRECTIONS[directionKey];
  if (!dir) {
    game.log.push("Invalid direction.");
    return;
  }

  const x = game.currentX + dir.dx;
  const y = game.currentY + dir.dy;
  if (x < 0 || y < 0 || x >= game.width || y >= game.height) {
    game.log.push("You cannot go that way.");
    return;
  }

  game.currentX = x;
  game.currentY = y;
  const room = game.map[y]?.[x];
  if (!room) {
    game.log.push("You are disoriented and cannot move there.");
    return;
  }
  room.discovered = true;
  addHealth(game.player, 15);

  const roomMeta = getRoomMeta(room);
  game.log.push(`${roomMeta.key}: ${roomMeta.description}`);
  if (room.enemy.alive) {
    game.log.push(room.enemy.description);
    if (room.enemy.phrase) {
      game.log.push(`${room.enemy.name}: "${room.enemy.phrase}"`);
    }
  }

  checkVictory(game);
}

export function checkVictory(game: Game): void {
  const room = getCurrentRoom(game);
  if (room.typeKey === "VAULT" && !room.enemy.alive) {
    game.status = "won";
    game.log.push("You found the vault and slayed the drake!");
    game.log.push("Now the treasure is yours.");
    game.log.push("You win!");
  }
}

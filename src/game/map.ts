import {
  DIFFICULTIES,
  DIRECTIONS,
  ENEMIES,
  ENEMY_TEMPLATE_KEYS,
  ITEM_KEYS,
  ITEMS,
  ROOM_TYPES,
  enemyFromTemplate,
  itemFromTemplate,
} from "./data";
import { addHealth, nextInt } from "./mechanics";
import type {
  DifficultyKey,
  DirectionKey,
  EnemyTemplateKey,
  Game,
  LootTag,
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

function pickWeightedItemKey(): (typeof ITEM_KEYS)[number] | undefined {
  const weighted = ITEM_KEYS.map((key) => ({
    key,
    weight: Math.max(0, ITEMS[key].dropWeight),
  }));
  return pickFromWeighted(weighted);
}

function pickFromWeighted(
  weighted: { key: (typeof ITEM_KEYS)[number]; weight: number }[],
): (typeof ITEM_KEYS)[number] | undefined {
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) {
    return ITEM_KEYS[nextInt(0, ITEM_KEYS.length - 1)];
  }

  let roll = Math.random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.key;
  }

  return weighted[weighted.length - 1]?.key;
}

function pickWeightedItemKeyForTags(
  tags: LootTag[],
): (typeof ITEM_KEYS)[number] | undefined {
  if (tags.length === 0) {
    return pickWeightedItemKey();
  }

  const tagged = ITEM_KEYS.filter((key) =>
    ITEMS[key].tags.some((tag) => tags.includes(tag)),
  );
  if (tagged.length === 0) {
    return pickWeightedItemKey();
  }

  return pickFromWeighted(
    tagged.map((key) => ({ key, weight: Math.max(0, ITEMS[key].dropWeight) })),
  );
}

function pickWeightedEnemyTemplateKeyForTags(
  tags: LootTag[],
): EnemyTemplateKey {
  const pool = ENEMY_TEMPLATE_KEYS.filter(
    (key) => key !== "EMPTY" && key !== "DRAKE",
  );
  if (pool.length === 0) {
    return "EMPTY";
  }

  const tagged = pool
    .map((key) => ({
      key,
      overlap: ENEMIES[key].lootTags.filter((tag) => tags.includes(tag)).length,
    }))
    .filter((entry) => entry.overlap > 0)
    .map((entry) => ({ key: entry.key, weight: entry.overlap }));

  const weightedPool =
    tagged.length > 0 ? tagged : pool.map((key) => ({ key, weight: 1 }));

  const total = weightedPool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weightedPool) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.key;
    }
  }

  return weightedPool[weightedPool.length - 1]?.key ?? "EMPTY";
}

function roomFromType(
  typeKey: RoomTypeKey,
  x: number,
  y: number,
  width: number,
  height: number,
  discovered = false,
  alwaysSpawnEnemy = false,
): Room {
  const type = ROOM_BY_KEY[typeKey];
  const shouldSpawnEnemy =
    typeKey !== "FOYER" && (alwaysSpawnEnemy || Math.random() >= 0.5);
  const enemyTemplateKey = shouldSpawnEnemy
    ? typeKey === "VAULT"
      ? "DRAKE"
      : pickWeightedEnemyTemplateKeyForTags(type.lootTags)
    : "EMPTY";
  const enemyLevel = getEnemyLevelForPosition(x, y, width, height, typeKey);
  const enemy = enemyFromTemplate(enemyTemplateKey, enemyLevel);

  if (enemy.alive && ITEM_KEYS.length > 0 && Math.random() < 0.25) {
    const itemKey = pickWeightedItemKeyForTags([
      ...enemy.lootTags,
      ...type.lootTags,
    ]);
    if (itemKey) enemy.inventory.push(itemFromTemplate(itemKey));
  }

  const items: (typeof ITEMS)[keyof typeof ITEMS][] = [];
  if (!enemy.alive && ITEM_KEYS.length > 0 && Math.random() < 0.18) {
    const itemKey = pickWeightedItemKeyForTags(type.lootTags);
    if (itemKey) items.push(itemFromTemplate(itemKey));
  }

  return {
    x,
    y,
    typeKey,
    discovered,
    enemy,
    items,
  };
}

function getEnemyLevelForPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  roomTypeKey: RoomTypeKey,
): number {
  const maxProgress = Math.max(1, width + height - 2);
  const progress = Math.min(1, (x + y) / maxProgress);
  const baseMaxLevel = Math.max(3, Math.floor(width / 3) + 1);
  const scaled = 1 + Math.floor(progress * (baseMaxLevel - 1));

  if (roomTypeKey === "VAULT") {
    return baseMaxLevel + 1;
  }

  return Math.max(1, Math.min(baseMaxLevel, scaled + nextInt(0, 1)));
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
        return roomFromType("FOYER", x, y, width, height, true, false);
      }
      if (x === vaultX && y === vaultY) {
        return roomFromType("VAULT", x, y, width, height, false, true);
      }
      return roomFromType(pickRandomRoomType(), x, y, width, height);
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
  addHealth(game.player, 3);

  // Tick item cooldowns down by one room
  const cds = game.player.itemCooldowns;
  (Object.keys(cds) as Array<keyof typeof cds>).forEach((k) => {
    const current = cds[k];
    if (current === undefined) return;
    if (current <= 1) delete cds[k];
    else cds[k] = current - 1;
  });

  game.player.inventory.forEach((item) => {
    if ((item.cooldownRemaining ?? 0) <= 0) return;
    if ((item.cooldownRemaining ?? 0) <= 1) {
      delete item.cooldownRemaining;
    } else {
      item.cooldownRemaining = (item.cooldownRemaining ?? 0) - 1;
    }
  });

  const roomMeta = getRoomMeta(room);
  game.log.push(`${roomMeta.key}: ${roomMeta.description}`);
  if (room.enemy.alive) {
    game.log.push(room.enemy.description);
    if (room.enemy.phrase) {
      game.log.push(`${room.enemy.name}: "${room.enemy.phrase}"`);
    }
  }

  if (room.items.length > 0) {
    game.log.push("You search the room and find:");
    for (const item of room.items) {
      game.player.inventory.push(item);
      game.log.push(`- ${item.label}`);
    }
    room.items = [];
  }

  checkVictory(game);
}

export function advanceEnemyRoaming(game: Game): void {
  if (game.status !== "playing") {
    return;
  }

  const roamingEnemyRooms: Room[] = game.map
    .flat()
    .filter(
      (room) =>
        room.enemy.alive && (room.discovered || room.enemy.undiscoveredRoaming),
    );

  for (const source of roamingEnemyRooms) {
    // The enemy may have moved earlier this tick due to another move chain.
    if (!source.enemy.alive) {
      continue;
    }

    // Do not roam enemies currently engaged with the player.
    if (source.x === game.currentX && source.y === game.currentY) {
      continue;
    }

    const enemy = source.enemy;

    if ((enemy.roamDelayRemaining ?? 0) > 0) {
      if ((enemy.roamDelayRemaining ?? 0) <= 1) {
        delete enemy.roamDelayRemaining;
      } else {
        enemy.roamDelayRemaining = (enemy.roamDelayRemaining ?? 0) - 1;
      }
      continue;
    }

    if (enemy.roamRate === 0) {
      continue;
    }

    if (enemy.roamRate < 0) {
      // Negative roamRate means the enemy never gets normal roaming steps,
      // but it can still use roamDelayRemaining as an externally assigned delay.
      continue;
    }

    let currentRoom = source;
    const steps = enemy.roamRate;
    for (let step = 0; step < steps; step++) {
      const openRooms = (
        Object.values(DIRECTIONS) as Array<(typeof DIRECTIONS)[DirectionKey]>
      )
        .map(
          (dir) => game.map[currentRoom.y + dir.dy]?.[currentRoom.x + dir.dx],
        )
        .filter((room): room is Room => Boolean(room && !room.enemy.alive));
      if (openRooms.length === 0) {
        break;
      }

      const target = openRooms[nextInt(0, openRooms.length - 1)];
      if (!target) {
        break;
      }

      currentRoom.enemy = enemyFromTemplate("EMPTY");
      target.enemy = enemy;
      currentRoom = target;

      if (target.x === game.currentX && target.y === game.currentY) {
        game.log.push(enemy.description);
        if (enemy.phrase) {
          game.log.push(`${enemy.name}: "${enemy.phrase}"`);
        }
        break;
      }
    }
  }
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

import type {
  Difficulty,
  DifficultyKey,
  Direction,
  DirectionKey,
  Enemy,
  EnemyTemplate,
  EnemyTemplateKey,
  Item,
  ItemKey,
  ItemTemplate,
  PlayerClass,
  PlayerClassKey,
  RoomTypeMeta,
} from "./types";

import difficultiesData from "./data/difficulties.json";
import classesData from "./data/classes.json";
import directionsData from "./data/directions.json";
import enemiesData from "./data/enemies.json";
import roomsData from "./data/rooms.json";
import itemsData from "./data/items.json";

export type {
  DifficultyKey,
  DirectionKey,
  Enemy,
  EnemyTemplateKey,
  Item,
  ItemKey,
  PlayerClassKey,
  RoomTypeKey,
  RoomTypeMeta,
} from "./types";

export const DIFFICULTIES = difficultiesData satisfies Record<
  DifficultyKey,
  Difficulty
>;

export const PLAYER_CLASSES = classesData as Record<
  PlayerClassKey,
  PlayerClass
>;

export const DIRECTIONS = directionsData satisfies Record<
  DirectionKey,
  Direction
>;

export const ENEMIES = enemiesData as Record<EnemyTemplateKey, EnemyTemplate>;

export const ENEMY_TEMPLATE_KEYS = Object.keys(ENEMIES) as EnemyTemplateKey[];

export const ROOM_TYPES = roomsData as RoomTypeMeta[];

export const ITEMS = itemsData as Record<ItemKey, ItemTemplate>;

export const ITEM_KEYS = Object.keys(ITEMS) as ItemKey[];

function createInstanceId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function itemFromTemplate(itemKey: ItemKey): Item {
  const template = ITEMS[itemKey];
  return {
    ...template,
    instanceId: createInstanceId(),
    template,
  };
}

export function enemyFromTemplate(templateKey: EnemyTemplateKey): Enemy {
  const template = ENEMIES[templateKey];
  return {
    ...template,
    instanceId: createInstanceId(),
    template,
    roamDelayRemaining:
      template.roamRate < 0 ? Math.abs(template.roamRate) : undefined,
    inventory: [],
  };
}

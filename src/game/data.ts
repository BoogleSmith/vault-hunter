import type {
  Armor,
  ArmorKey,
  Difficulty,
  DifficultyKey,
  Direction,
  DirectionKey,
  Enemy,
  EnemyTemplateKey,
  Item,
  ItemKey,
  PlayerClass,
  PlayerClassKey,
  RoomTypeMeta,
} from "./types";

import difficultiesData from "./data/difficulties.json";
import armorData from "./data/armor.json";
import classesData from "./data/classes.json";
import directionsData from "./data/directions.json";
import enemiesData from "./data/enemies.json";
import roomsData from "./data/rooms.json";
import itemsData from "./data/items.json";

export type {
  ArmorKey,
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

export const ARMOR = armorData satisfies Record<ArmorKey, Armor>;

export const PLAYER_CLASSES = classesData satisfies Record<
  PlayerClassKey,
  PlayerClass
>;

export const DIRECTIONS = directionsData satisfies Record<
  DirectionKey,
  Direction
>;

type EnemyTemplate = Omit<Enemy, "inventory">;

export const ENEMIES = enemiesData as Record<EnemyTemplateKey, EnemyTemplate>;

export const ENEMY_TEMPLATE_KEYS = Object.keys(ENEMIES) as EnemyTemplateKey[];

export const ROOM_TYPES = roomsData as RoomTypeMeta[];

export const ITEMS = itemsData as Record<ItemKey, Item>;

export const ITEM_KEYS = Object.keys(ITEMS) as ItemKey[];

export function enemyFromTemplate(templateKey: EnemyTemplateKey): Enemy {
  const template = ENEMIES[templateKey];
  return {
    ...template,
    roamDelayRemaining:
      template.roamRate < 0 ? Math.abs(template.roamRate) : undefined,
    inventory: [],
  };
}

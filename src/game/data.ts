import type {
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

type EnemyTemplate = Omit<Enemy, "inventory">;
type EnemyTemplateData = Omit<
  Enemy,
  "inventory" | "level" | "experienceReward"
>;

export const ENEMIES = enemiesData as Record<
  EnemyTemplateKey,
  EnemyTemplateData
>;

export const ENEMY_TEMPLATE_KEYS = Object.keys(ENEMIES) as EnemyTemplateKey[];

export const ROOM_TYPES = roomsData as RoomTypeMeta[];

export const ITEMS = itemsData as Record<ItemKey, Item>;

export const ITEM_KEYS = Object.keys(ITEMS) as ItemKey[];

let nextItemInstanceId = 1;

export function itemFromTemplate(itemKey: ItemKey): Item {
  return {
    ...ITEMS[itemKey],
    instanceId: nextItemInstanceId++,
  };
}

export function enemyFromTemplate(
  templateKey: EnemyTemplateKey,
  level = 1,
): Enemy {
  const template = ENEMIES[templateKey];
  const safeLevel = template.alive ? Math.max(1, level) : 0;
  const healthMultiplier = 1 + Math.max(0, safeLevel - 1) * 0.18;
  const offenseMultiplier = 1 + Math.max(0, safeLevel - 1) * 0.12;
  const finesseMultiplier = 1 + Math.max(0, safeLevel - 1) * 0.07;

  const scaledHealthMax = Math.max(
    1,
    Math.round(template.healthMax * healthMultiplier),
  );
  const scaledHealth = Math.max(
    1,
    Math.round(template.health * healthMultiplier),
  );
  const scaledDamageBase = Math.max(
    1,
    Math.round(template.damageBase * offenseMultiplier),
  );
  const scaledDamageMax = Math.max(
    1,
    Math.round(template.damageMax * offenseMultiplier),
  );
  const scaledAgility = Math.max(
    0,
    Math.round(template.agility * finesseMultiplier),
  );
  const scaledDexterity = Math.max(
    0,
    Math.round(template.dexterity * finesseMultiplier),
  );
  const scaledArmor = Number(
    Math.max(0, template.armor + Math.max(0, safeLevel - 1) * 0.02).toFixed(2),
  );

  const baseExperience = Math.max(
    6,
    Math.round(
      scaledHealthMax * 0.12 +
        scaledDamageBase * 1.4 +
        scaledDamageMax * 1.2 +
        scaledAgility * 0.35 +
        scaledDexterity * 0.35 +
        scaledArmor * 20,
    ),
  );

  const experienceReward = template.alive
    ? Math.round(baseExperience * (1 + Math.max(0, safeLevel - 1) * 0.2))
    : 0;

  return {
    ...template,
    level: safeLevel,
    experienceReward,
    health: template.alive ? Math.min(scaledHealth, scaledHealthMax) : 0,
    healthMax: template.alive ? scaledHealthMax : 0,
    damageBase: template.alive ? scaledDamageBase : 0,
    damageMax: template.alive ? scaledDamageMax : 0,
    agility: template.alive ? scaledAgility : 0,
    dexterity: template.alive ? scaledDexterity : 0,
    armor: template.alive ? scaledArmor : 0,
    roamDelayRemaining:
      template.roamRate < 0 ? Math.abs(template.roamRate) : undefined,
    inventory: [],
  };
}

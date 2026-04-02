import { ITEMS, itemFromTemplate, PLAYER_CLASSES } from "./data";
import {
  applyItemEffect,
  removeItemEffect,
  resolveEquipTargets,
} from "./mechanics";
import type { Item, Player, PlayerClassKey, UnitBase } from "./types";

const BASE_PLAYER: UnitBase = {
  health: 100,
  healthMax: 100,
  damageBase: 5,
  damageMax: 10,
  agility: 10,
  dexterity: 15,
  alive: true,
};

export function getStartingStatsForClass(classKey: PlayerClassKey): UnitBase {
  const stats = getClassStatsBeforeEquipment(classKey);
  const playerClass = PLAYER_CLASSES[classKey];

  // Starting equipment is auto-equipped and affects opening stats.
  for (const itemKey of playerClass.startingItems) {
    const item = ITEMS[itemKey];
    if (!item.equipSlots?.length) {
      continue;
    }
    const effect = item.effect;
    if (effect.healthMax) {
      stats.healthMax += effect.healthMax;
      stats.health = Math.min(stats.health + effect.healthMax, stats.healthMax);
    }
    if (effect.health) {
      stats.health = Math.min(stats.health + effect.health, stats.healthMax);
    }
    if (effect.damageBase) stats.damageBase += effect.damageBase;
    if (effect.damageMax) stats.damageMax += effect.damageMax;
    if (effect.agility) stats.agility += effect.agility;
    if (effect.dexterity) stats.dexterity += effect.dexterity;
  }

  return stats;
}

function getClassStatsBeforeEquipment(classKey: PlayerClassKey): UnitBase {
  const playerClass = PLAYER_CLASSES[classKey];
  const bonuses = playerClass.bonuses;

  return {
    health: BASE_PLAYER.health + bonuses.health,
    healthMax: BASE_PLAYER.healthMax + bonuses.healthMax,
    damageBase: BASE_PLAYER.damageBase + bonuses.damageBase,
    damageMax:
      BASE_PLAYER.damageBase + BASE_PLAYER.damageMax + bonuses.damageMax,
    agility: BASE_PLAYER.agility + bonuses.agility,
    dexterity: BASE_PLAYER.dexterity + bonuses.dexterity,
    alive: true,
  };
}

export function createPlayer({
  name,
  classKey,
}: {
  name: string;
  classKey: PlayerClassKey;
}): Player {
  const playerClass = PLAYER_CLASSES[classKey];
  const baseStats = getClassStatsBeforeEquipment(classKey);

  const player: Player = {
    name: name.trim() || "Stranger",
    classKey,
    health: baseStats.health,
    healthMax: baseStats.healthMax,
    damageBase: baseStats.damageBase,
    damageMax: baseStats.damageMax,
    agility: baseStats.agility,
    dexterity: baseStats.dexterity,
    alive: true,
    inventory: [],
    equipment: {},
    itemCooldowns: {},
    usedItemKeys: [],
  };

  for (const itemKey of playerClass.startingItems) {
    const item = itemFromTemplate(itemKey);
    player.inventory.push(item);
    equipStartingItem(player, item);
  }

  return player;
}

function equipStartingItem(player: Player, item: Item): void {
  const requirements = item.equipSlots ?? [];
  if (requirements.length === 0 || item.instanceId === undefined) {
    return;
  }

  const equipSlots = resolveEquipTargets(player, requirements, item.instanceId);

  const overlappingIds = Array.from(
    new Set(
      equipSlots
        .map((slot) => player.equipment[slot])
        .filter((id): id is number => id !== undefined),
    ),
  );

  for (const instanceId of overlappingIds) {
    const equippedItem = player.inventory.find(
      (entry) => entry.instanceId === instanceId,
    );
    if (equippedItem) {
      removeItemEffect(player, equippedItem);
    }
    for (const slot of Object.keys(player.equipment) as Array<
      keyof typeof player.equipment
    >) {
      if (player.equipment[slot] === instanceId) {
        delete player.equipment[slot];
      }
    }
  }

  applyItemEffect(player, item);
  for (const slot of equipSlots) {
    player.equipment[slot] = item.instanceId;
  }
}

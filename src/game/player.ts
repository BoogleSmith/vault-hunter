import { itemFromTemplate, PLAYER_CLASSES } from "./data";
import type { ArmorKey, Player, PlayerClassKey, UnitBase } from "./types";

const BASE_PLAYER: UnitBase = {
  health: 100,
  healthMax: 100,
  damageBase: 5,
  damageMax: 10,
  agility: 10,
  dexterity: 15,
  alive: true,
};

export function createPlayer({
  name,
  classKey,
  armorKey,
}: {
  name: string;
  classKey: PlayerClassKey;
  armorKey: ArmorKey;
}): Player {
  const bonuses = PLAYER_CLASSES[classKey].bonuses;

  return {
    name: name.trim() || "Stranger",
    classKey,
    armor: armorKey,
    health: BASE_PLAYER.health + bonuses.health,
    healthMax: BASE_PLAYER.healthMax + bonuses.healthMax,
    damageBase: BASE_PLAYER.damageBase + bonuses.damageBase,
    damageMax:
      BASE_PLAYER.damageBase + BASE_PLAYER.damageMax + bonuses.damageMax,
    agility: BASE_PLAYER.agility + bonuses.agility,
    dexterity: BASE_PLAYER.dexterity + bonuses.dexterity,
    alive: true,
    inventory: [
      itemFromTemplate("HEALTH_POTION"),
      itemFromTemplate("HEALTH_POTION"),
    ],
    equipment: {},
    itemCooldowns: {},
    usedItemKeys: [],
  };
}

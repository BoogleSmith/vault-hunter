export type DifficultyKey = "SHORT" | "MEDIUM" | "LONG";

export type ItemKey =
  | "HEALTH_POTION"
  | "GREAT_HEALTH_POTION"
  | "RUSTY_SWORD"
  | "BONE_DAGGER"
  | "SILVER_SWORD"
  | "SHADOW_CLOAK"
  | "AMULET_OF_SWIFTNESS"
  | "RING_OF_VIGOR"
  | "CURSED_IDOL";

export type ItemType = "potion" | "weapon" | "accessory" | "relic";

export type ItemSlot =
  | "leftHand"
  | "rightHand"
  | "leftAccessory"
  | "rightAccessory"
  | "head"
  | "back"
  | "chest";

export type LootTag =
  | "common"
  | "undead"
  | "beast"
  | "cult"
  | "raider"
  | "guardian"
  | "spectral"
  | "giant"
  | "dragon"
  | "healing"
  | "vitality"
  | "agile"
  | "dexterous"
  | "cursed"
  | "martial";

export interface ItemEffect {
  health?: number;
  healthMax?: number;
  damageBase?: number;
  damageMax?: number;
  agility?: number;
  dexterity?: number;
}

export interface Item {
  key: ItemKey;
  label: string;
  description: string;
  type: ItemType;
  tags: LootTag[];
  equipSlots: ItemSlot[];
  instanceId?: number;
  dropWeight: number;
  stackable: boolean;
  usable: boolean;
  consumable: boolean;
  sharedCooldown: boolean;
  cooldown: number;
  cooldownRemaining?: number;
  effect: ItemEffect;
}
export type ArmorKey = "UNARMORED" | "LIGHT" | "MEDIUM" | "HEAVY";
export type PlayerClassKey = "WARRIOR" | "THEIF" | "ROGUE" | "BRAWLER";
export type DirectionKey = "RIGHT" | "DOWN" | "LEFT" | "UP";
export type EnemyTemplateKey =
  | "EMPTY"
  | "SKELETON"
  | "ZOMBIE"
  | "CULTIST"
  | "RAIDER"
  | "SPECTRALGUARD"
  | "GARGOYL"
  | "HELLHOUND"
  | "WRAITH"
  | "POLTERGEIST"
  | "CYCLOPS"
  | "LUMBERINGHORROR"
  | "DRAKE";

export type RoomTypeKey =
  | "FOYER"
  | "CATACOMBS"
  | "DUNGEON"
  | "SANCTUARY"
  | "BALLROOM"
  | "ARMORY"
  | "YARD"
  | "GROUNDS"
  | "HALLWAY"
  | "MAUSOLEUM"
  | "THRONEROOM"
  | "PRECIPICE"
  | "VAULT";

export interface Difficulty {
  label: string;
  width: number;
  height: number;
}

export interface Armor {
  label: string;
  constant: number;
}

export interface UnitBonuses {
  health: number;
  healthMax: number;
  damageBase: number;
  damageMax: number;
  agility: number;
  dexterity: number;
}

export interface PlayerClass {
  label: string;
  bonuses: UnitBonuses;
}

export interface Direction {
  label: string;
  dx: number;
  dy: number;
}

export interface UnitBase {
  health: number;
  healthMax: number;
  damageBase: number;
  damageMax: number;
  agility: number;
  dexterity: number;
  alive: boolean;
}

export interface Enemy extends UnitBase {
  name: string;
  armor: ArmorKey;
  phrase: string;
  description: string;
  lootTags: LootTag[];
  roamRate: number;
  undiscoveredRoaming: boolean;
  roamDelayRemaining?: number;
  inventory: Item[];
}

export interface Player extends UnitBase {
  name: string;
  classKey: PlayerClassKey;
  armor: ArmorKey;
  inventory: Item[];
  equipment: Partial<Record<ItemSlot, number>>;
  itemCooldowns: Partial<Record<ItemKey, number>>;
  usedItemKeys: ItemKey[];
}

export interface RoomTypeMeta {
  key: RoomTypeKey;
  tile: string;
  description: string;
  lootTags: LootTag[];
}

export interface Room {
  x: number;
  y: number;
  typeKey: RoomTypeKey;
  discovered: boolean;
  enemy: Enemy;
  items: Item[];
}

export type GameStatus = "playing" | "won" | "lost";

export interface Game {
  difficultyKey: DifficultyKey;
  width: number;
  height: number;
  currentX: number;
  currentY: number;
  map: Room[][];
  player: Player;
  log: string[];
  status: GameStatus;
}

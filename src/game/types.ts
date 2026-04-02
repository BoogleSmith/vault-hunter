export type DifficultyKey = "SHORT" | "MEDIUM" | "LONG";

export type ItemKey =
  | "HEALTH_POTION"
  | "GREAT_HEALTH_POTION"
  | "LEATHER_TUNIC"
  | "CHAIN_MAIL"
  | "PLATE_ARMOR"
  | "IRON_HELM"
  | "SPIKED_HELM"
  | "GUARDIAN_GREAVES"
  | "SHADOW_LEGGINGS"
  | "RUSTY_SWORD"
  | "BONE_DAGGER"
  | "SILVER_SWORD"
  | "WAR_AXE"
  | "SPEAR"
  | "GREATSWORD"
  | "HUNTER_BOW"
  | "ROUND_SHIELD"
  | "TOWER_SHIELD"
  | "SHADOW_CLOAK"
  | "AMULET_OF_SWIFTNESS"
  | "AMULET_OF_FORTITUDE"
  | "AMULET_OF_FURY"
  | "RING_OF_VIGOR"
  | "RING_OF_PRECISION"
  | "RING_OF_GUARDING"
  | "CURSED_IDOL";

export type ItemType = "potion" | "weapon" | "accessory" | "armor" | "relic";

export type ItemSlot =
  | "leftHand"
  | "rightHand"
  | "leftAccessory"
  | "rightAccessory"
  | "head"
  | "amulet"
  | "back"
  | "chest"
  | "legs";

export type EquipRequirement =
  | "hand"
  | "ring"
  | "head"
  | "amulet"
  | "back"
  | "chest"
  | "legs";

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

export type Entity<TTemplate> = TTemplate & {
  instanceId: string;
  template: TTemplate;
};

export interface ItemTemplate {
  key: ItemKey;
  label: string;
  description: string;
  type: ItemType;
  tags: LootTag[];
  armorValue?: number;
  equipSlots?: EquipRequirement[];
  dropWeight: number;
  rarity: number;
  stackable: boolean;
  usable: boolean;
  consumable: boolean;
  sharedCooldown: boolean;
  cooldown: number;
  effect: ItemEffect;
}

export type Item = Entity<ItemTemplate> & {
  cooldownRemaining?: number;
};
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
  summary: string;
  bonuses: UnitBonuses;
  levelBonuses: UnitBonuses;
  startingItems: ItemKey[];
}

export interface Direction {
  label: string;
  dx: number;
  dy: number;
}

export interface Damageable {
  health: number;
  healthMax: number;
}

export interface Combative {
  damageBase: number;
  damageMax: number;
}

export interface Levelable {
  level: number;
  experience: number;
}

export interface Inventory {
  inventory: Item[];
}

export interface UnitBase extends Damageable, Combative {
  agility: number;
  dexterity: number;
  alive: boolean;
}

export interface EnemyTemplate extends UnitBase {
  name: string;
  level: number;
  experienceReward: number;
  armor: number;
  phrase: string;
  description: string;
  lootTags: LootTag[];
  roamRate: number;
  undiscoveredRoaming: boolean;
}

export type Enemy = Entity<EnemyTemplate> &
  Inventory & {
    roamDelayRemaining?: number;
  };

export interface PlayerTemplate {
  classKey: PlayerClassKey;
}

export type Player = Entity<PlayerTemplate> &
  UnitBase &
  Levelable &
  Inventory & {
    name: string;
    classKey: PlayerClassKey;
    equipment: Partial<Record<ItemSlot, string>>;
    itemCooldowns: Partial<Record<ItemKey, number>>;
    usedItemKeys: ItemKey[];
  };

export interface RoomTypeMeta {
  key: RoomTypeKey;
  tile: string;
  description: string;
  lootTags: LootTag[];
}

export interface RoomTemplate {
  typeKey: RoomTypeKey;
}

export type Room = Entity<RoomTemplate> & {
  x: number;
  y: number;
  typeKey: RoomTypeKey;
  discovered: boolean;
  enemy: Enemy;
  items: Item[];
};

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

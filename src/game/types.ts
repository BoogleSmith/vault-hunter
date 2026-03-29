export type DifficultyKey = "SHORT" | "MEDIUM" | "LONG";
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
}

export interface Player extends UnitBase {
  name: string;
  classKey: PlayerClassKey;
  armor: ArmorKey;
}

export interface RoomTypeMeta {
  key: RoomTypeKey;
  tile: string;
  enemy: EnemyTemplateKey;
  description: string;
}

export interface Room {
  x: number;
  y: number;
  typeKey: RoomTypeKey;
  discovered: boolean;
  enemy: Enemy;
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

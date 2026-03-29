export { createPlayer } from "./player";
export {
  createGame,
  getAvailableDirections,
  getCurrentRoom,
  getRoomMeta,
  movePlayer,
} from "./map";
export { runCombatRound, tryFlee } from "./combat";
export { equipItem, unequipSlot, useItem } from "./mechanics";

export type {
  EquipRequirement,
  Game,
  GameStatus,
  Item,
  ItemEffect,
  ItemKey,
  ItemSlot,
  Player,
  Room,
} from "./types";

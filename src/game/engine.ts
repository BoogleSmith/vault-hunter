export { createPlayer } from "./player";
export {
  createGame,
  getAvailableDirections,
  getCurrentRoom,
  getRoomMeta,
  movePlayer,
} from "./map";
export { runCombatRound, tryFlee } from "./combat";
export { useItem } from "./mechanics";

export type {
  Game,
  GameStatus,
  Item,
  ItemEffect,
  ItemKey,
  Player,
  Room,
} from "./types";

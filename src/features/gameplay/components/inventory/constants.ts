import type { RequirementLabelMap, SlotConfig, TypeIconMap } from "./types";

export const SLOT_CONFIGS: SlotConfig[] = [
  { slot: "head", icon: "🪖", label: "Head", row: 1, col: 2 },
  { slot: "amulet", icon: "📿", label: "Amulet", row: 2, col: 2 },
  { slot: "leftHand", icon: "🗡️", label: "L. Hand", row: 3, col: 1 },
  { slot: "chest", icon: "🛡️", label: "Chest", row: 3, col: 2 },
  { slot: "rightHand", icon: "⚔️", label: "R. Hand", row: 3, col: 3 },
  { slot: "leftAccessory", icon: "💍", label: "L. Ring", row: 4, col: 1 },
  { slot: "back", icon: "🧥", label: "Back", row: 4, col: 2 },
  { slot: "rightAccessory", icon: "💍", label: "R. Ring", row: 4, col: 3 },
  { slot: "legs", icon: "👖", label: "Legs", row: 5, col: 2 },
];

export const TYPE_ICON: TypeIconMap = {
  potion: "🧪",
  weapon: "⚔️",
  accessory: "💍",
  armor: "🛡️",
  relic: "🗿",
};

export const REQUIREMENT_LABELS: RequirementLabelMap = {
  hand: "Hand",
  ring: "Ring",
  head: "Head",
  amulet: "Amulet",
  back: "Back",
  chest: "Chest",
  legs: "Legs",
};

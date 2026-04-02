import type {
  EquipRequirement,
  Game,
  Item,
  ItemSlot,
} from "../../../../game/engine";

export interface SlotConfig {
  slot: ItemSlot;
  icon: string;
  label: string;
  row: number;
  col: number;
}

export interface DisplayRow {
  item: Item;
  count: number;
  indices: number[];
}

export interface EffectToken {
  text: string;
  tone: "positive" | "negative";
}

export interface EquipmentModalProps {
  game: Game;
  onClose: () => void;
  onUseItem: (index: number) => void;
  onEquipItem: (index: number) => void;
  onUnequipSlot: (slot: ItemSlot) => void;
}

export type TypeIconMap = Record<Item["type"], string>;
export type RequirementLabelMap = Record<EquipRequirement, string>;

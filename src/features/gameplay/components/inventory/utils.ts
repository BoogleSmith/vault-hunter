import type { Game, Item } from "../../../../game/engine";
import type { DisplayRow, EffectToken } from "./types";

export function buildRows(
  entries: Array<{ item: Item; index: number }>,
): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const stackIndex = new Map<string, number>();

  entries.forEach(({ item, index }) => {
    if (item.stackable) {
      const rowIdx = stackIndex.get(item.key);
      if (rowIdx !== undefined) {
        rows[rowIdx]!.count++;
        rows[rowIdx]!.indices.push(index);
      } else {
        stackIndex.set(item.key, rows.length);
        rows.push({ item, count: 1, indices: [index] });
      }
    } else {
      rows.push({ item, count: 1, indices: [index] });
    }
  });

  return rows;
}

export function getTotalArmorValue(game: Game): number {
  const equippedIds = new Set(
    Object.values(game.player.equipment).filter(
      (id): id is string => id !== undefined,
    ),
  );

  let total = 0;
  for (const item of game.player.inventory) {
    if (!equippedIds.has(item.instanceId) || !item.armorValue) {
      continue;
    }
    total += item.armorValue;
  }

  return Math.max(0, total);
}

function formatSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatSignedFixed(value: number, digits: number): string {
  if (value > 0) return `+${value.toFixed(digits)}`;
  return value.toFixed(digits);
}

export function getItemEffectTokens(item: Item): EffectToken[] {
  const parts: EffectToken[] = [];

  if (item.armorValue) {
    parts.push({
      text: `${formatSignedFixed(item.armorValue, 2)} armor`,
      tone: item.armorValue > 0 ? "positive" : "negative",
    });
  }

  const { effect } = item;
  if (effect.healthMax) {
    parts.push({
      text: `${formatSignedValue(effect.healthMax)} max HP`,
      tone: effect.healthMax > 0 ? "positive" : "negative",
    });
  }
  if (effect.health) {
    parts.push({
      text: `${formatSignedValue(effect.health)} HP`,
      tone: effect.health > 0 ? "positive" : "negative",
    });
  }
  if (effect.damageBase) {
    parts.push({
      text: `${formatSignedValue(effect.damageBase)} min dmg`,
      tone: effect.damageBase > 0 ? "positive" : "negative",
    });
  }
  if (effect.damageMax) {
    parts.push({
      text: `${formatSignedValue(effect.damageMax)} max dmg`,
      tone: effect.damageMax > 0 ? "positive" : "negative",
    });
  }
  if (effect.agility) {
    parts.push({
      text: `${formatSignedValue(effect.agility)} agility`,
      tone: effect.agility > 0 ? "positive" : "negative",
    });
  }
  if (effect.dexterity) {
    parts.push({
      text: `${formatSignedValue(effect.dexterity)} dexterity`,
      tone: effect.dexterity > 0 ? "positive" : "negative",
    });
  }

  return parts;
}

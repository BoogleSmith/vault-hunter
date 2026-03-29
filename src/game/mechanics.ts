import type { Game, Item, Player, UnitBase } from "./types";

export function nextInt(a: number, b: number): number {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function addHealth(unit: UnitBase, amount: number): void {
  const next = unit.health + amount;
  if (next >= unit.healthMax) {
    unit.health = unit.healthMax;
  } else if (next <= 0) {
    unit.health = 0;
    unit.alive = false;
  } else {
    unit.health = next;
  }
}

export function applyItemEffect(player: Player, item: Item): void {
  const e = item.effect;
  if (e.healthMax) {
    player.healthMax += e.healthMax;
  }
  if (e.health) {
    // Use addHealth so it respects the (possibly newly raised) cap
    addHealth(player, e.health);
  }
  if (e.damageBase) player.damageBase += e.damageBase;
  if (e.damageMax) player.damageMax += e.damageMax;
  if (e.agility) player.agility += e.agility;
  if (e.dexterity) player.dexterity += e.dexterity;
}

export function useItem(game: Game, index: number): void {
  const item = game.player.inventory[index];
  if (!item || !item.usable) return;

  const cooldownRemaining = item.sharedCooldown
    ? (game.player.itemCooldowns[item.key] ?? 0)
    : (item.cooldownRemaining ?? 0);
  if (cooldownRemaining > 0) {
    game.log.push(
      `${item.label} is on cooldown (${cooldownRemaining} room${
        cooldownRemaining !== 1 ? "s" : ""
      } remaining).`,
    );
    return;
  }

  const alreadyApplied = game.player.usedItemKeys.includes(item.key);

  if (!item.consumable && alreadyApplied) {
    // Re-use after cooldown: only restore HP, never re-apply permanent stats
    if (!item.effect.health) {
      game.log.push(`${item.label} has already been fully empowered.`);
      return;
    }
    if (game.player.health >= game.player.healthMax) {
      game.log.push(`You are already at full health.`);
      return;
    }
    addHealth(game.player, item.effect.health);
    game.log.push(
      `You channeled the ${item.label}, restoring ${item.effect.health} HP.`,
    );
  } else {
    const isHealthOnly =
      item.effect.health !== undefined &&
      Object.keys(item.effect).every((k) => k === "health");
    if (isHealthOnly && game.player.health >= game.player.healthMax) {
      game.log.push(`You are already at full health.`);
      return;
    }
    applyItemEffect(game.player, item);
    if (!item.consumable) {
      game.player.usedItemKeys.push(item.key);
    }
    game.log.push(`You used ${item.label}.`);
  }

  if (item.consumable) {
    game.player.inventory.splice(index, 1);
  } else if (item.cooldown > 0) {
    if (item.sharedCooldown) {
      game.player.itemCooldowns[item.key] = item.cooldown;
    } else {
      item.cooldownRemaining = item.cooldown;
    }
  }
}

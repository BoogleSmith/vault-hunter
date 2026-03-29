import type { Game, Item, ItemSlot, Player, UnitBase } from "./types";

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

export function removeItemEffect(player: Player, item: Item): void {
  const e = item.effect;
  if (e.healthMax) {
    player.healthMax = Math.max(1, player.healthMax - e.healthMax);
    player.health = Math.min(player.health, player.healthMax);
  }
  if (e.damageBase) player.damageBase -= e.damageBase;
  if (e.damageMax) player.damageMax -= e.damageMax;
  if (e.agility) player.agility -= e.agility;
  if (e.dexterity) player.dexterity -= e.dexterity;
}

function clearEquipmentSlots(player: Player, instanceId: number): void {
  (Object.keys(player.equipment) as ItemSlot[]).forEach((slot) => {
    if (player.equipment[slot] === instanceId) {
      delete player.equipment[slot];
    }
  });
}

function unequipByInstanceId(player: Player, instanceId: number): void {
  const item = player.inventory.find(
    (entry) => entry.instanceId === instanceId,
  );
  if (!item) {
    clearEquipmentSlots(player, instanceId);
    return;
  }
  removeItemEffect(player, item);
  clearEquipmentSlots(player, instanceId);
}

export function unequipSlot(game: Game, slot: ItemSlot): boolean {
  const instanceId = game.player.equipment[slot];
  if (instanceId === undefined) return false;
  const item = game.player.inventory.find((e) => e.instanceId === instanceId);
  if (item) game.log.push(`You unequipped ${item.label}.`);
  unequipByInstanceId(game.player, instanceId);
  return true;
}

export function equipItem(game: Game, index: number): boolean {
  const item = game.player.inventory[index];
  const equipSlots = item?.equipSlots ?? [];
  if (!item || equipSlots.length === 0 || item.instanceId === undefined) {
    return false;
  }

  const alreadyEquipped = equipSlots.every(
    (slot) => game.player.equipment[slot] === item.instanceId,
  );
  if (alreadyEquipped) {
    game.log.push(`${item.label} is already equipped.`);
    return false;
  }

  const overlappingIds = Array.from(
    new Set(
      equipSlots
        .map((slot) => game.player.equipment[slot])
        .filter((instanceId): instanceId is number => instanceId !== undefined),
    ),
  );

  for (const instanceId of overlappingIds) {
    const equippedItem = game.player.inventory.find(
      (entry) => entry.instanceId === instanceId,
    );
    if (equippedItem) {
      game.log.push(`You unequipped ${equippedItem.label}.`);
    }
    unequipByInstanceId(game.player, instanceId);
  }

  applyItemEffect(game.player, item);
  equipSlots.forEach((slot) => {
    game.player.equipment[slot] = item.instanceId;
  });
  game.log.push(`You equipped ${item.label}.`);
  return true;
}

export function useItem(game: Game, index: number): boolean {
  const item = game.player.inventory[index];
  if (!item || !item.usable) return false;

  const cooldownRemaining = item.sharedCooldown
    ? (game.player.itemCooldowns[item.key] ?? 0)
    : (item.cooldownRemaining ?? 0);
  if (cooldownRemaining > 0) {
    game.log.push(
      `${item.label} is on cooldown (${cooldownRemaining} room${
        cooldownRemaining !== 1 ? "s" : ""
      } remaining).`,
    );
    return false;
  }

  const alreadyApplied = game.player.usedItemKeys.includes(item.key);

  if (!item.consumable && alreadyApplied) {
    // Re-use after cooldown: only restore HP, never re-apply permanent stats
    if (!item.effect.health) {
      game.log.push(`${item.label} has already been fully empowered.`);
      return false;
    }
    if (game.player.health >= game.player.healthMax) {
      game.log.push(`You are already at full health.`);
      return false;
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
      return false;
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

  return true;
}

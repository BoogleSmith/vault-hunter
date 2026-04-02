import { addHealth, nextInt } from "./mechanics";
import { gainExperience, getExperienceToNextLevel } from "./player";
import {
  checkVictory,
  getAvailableDirections,
  getCurrentRoom,
  movePlayer,
} from "./map";
import type { Combative, Damageable, DirectionKey, Game } from "./types";

function getPlayerArmorValue(game: Game): number {
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

function armorDivisor(armorValue: number): number {
  return Math.max(1, 1 + armorValue);
}

function checkEvade(
  target: { agility: number; armorValue: number },
  attackerDexterity: number,
): boolean {
  const effectiveAgility = Math.floor(
    target.agility / armorDivisor(target.armorValue),
  );
  const randomDodge = nextInt(0, Math.max(effectiveAgility, 0));
  const randomHit = nextInt(0, Math.max(attackerDexterity, 0));
  return randomDodge < randomHit;
}

function calculateDamage(
  source: Combative,
  target: { armorValue: number },
): number {
  const roll = nextInt(source.damageMax, source.damageBase);
  return Math.max(1, Math.round(roll / armorDivisor(target.armorValue)));
}

function attack(
  source: { name: string; alive: boolean; dexterity: number } & Damageable &
    Combative,
  target: { name: string; alive: boolean; agility: number } & Damageable,
  targetArmorValue: number,
): string {
  if (!source.alive || !target.alive) {
    return `${source.name || "Unit"} cannot attack right now.`;
  }

  const hit = checkEvade(
    { agility: target.agility, armorValue: targetArmorValue },
    source.dexterity,
  );
  if (!hit) {
    return `${source.name} misses ${target.name}.`;
  }

  const damage = calculateDamage(source, { armorValue: targetArmorValue });
  addHealth(target, -damage);
  if (!target.alive) {
    return `${source.name} hits ${target.name} for ${damage}. ${target.name} is defeated.`;
  }
  return `${source.name} hits ${target.name} for ${damage}.`;
}

export function runCombatRound(game: Game): void {
  const room = getCurrentRoom(game);
  if (!room.enemy.alive || !game.player.alive) {
    return;
  }

  game.log.push(attack(game.player, room.enemy, room.enemy.armor));
  if (room.enemy.alive) {
    game.log.push(attack(room.enemy, game.player, getPlayerArmorValue(game)));
  } else {
    const experienceAward = room.enemy.experienceReward;
    if (experienceAward > 0) {
      const previousLevel = game.player.level;
      const levelResult = gainExperience(game.player, experienceAward);
      game.log.push(
        `You gained ${experienceAward} XP from level ${room.enemy.level} ${room.enemy.name}.`,
      );
      if (levelResult.levelsGained > 0) {
        game.log.push(
          `Level up! ${game.player.name} reached level ${game.player.level}.`,
        );
      } else {
        const xpToNext = getExperienceToNextLevel(game.player);
        game.log.push(
          `XP progress: ${game.player.experience}/${xpToNext} (Level ${previousLevel}).`,
        );
      }
    }
  }
  if (!game.player.alive) {
    game.status = "lost";
    game.log.push("You have fallen. Game over.");
  }

  checkVictory(game);
}

export function searchBody(game: Game): void {
  const room = getCurrentRoom(game);
  if (room.enemy.alive) {
    game.log.push("The enemy isn't dead yet.");
    return;
  }
  if (room.enemy.inventory.length === 0) {
    game.log.push("You search the body but find nothing of value.");
    return;
  }
  for (const item of room.enemy.inventory) {
    game.player.inventory.push(item);
    game.log.push(`You found ${item.label} on the body!`);
  }
  room.enemy.inventory = [];
}

export function tryFlee(game: Game): void {
  const room = getCurrentRoom(game);
  if (!room.enemy.alive) {
    game.log.push("There is nothing to flee from.");
    return;
  }

  const escaped = !checkEvade(
    {
      agility: game.player.agility,
      armorValue: getPlayerArmorValue(game),
    },
    room.enemy.dexterity,
  );
  if (!escaped) {
    game.log.push(`${game.player.name} failed to escape!`);
    game.log.push(attack(room.enemy, game.player, getPlayerArmorValue(game)));
    if (!game.player.alive) {
      game.status = "lost";
      game.log.push("You have fallen. Game over.");
    }
    return;
  }

  const options = (
    Object.entries(getAvailableDirections(game)) as [DirectionKey, boolean][]
  )
    .filter(([, ok]) => ok)
    .map(([key]) => key);
  if (options.length === 0) {
    game.log.push("No escape route is open.");
    return;
  }
  const directionKey = options[nextInt(0, options.length - 1)];
  if (!directionKey) {
    game.log.push("No escape route is open.");
    return;
  }

  room.enemy.roamDelayRemaining = Math.max(
    1,
    room.enemy.roamRate < 0 ? Math.abs(room.enemy.roamRate) : 0,
  );

  game.log.push(`${game.player.name} escaped!`);
  movePlayer(game, directionKey);
}

export function runEnemyTurn(game: Game): void {
  const room = getCurrentRoom(game);
  if (!room.enemy.alive || !game.player.alive) {
    return;
  }

  game.log.push(attack(room.enemy, game.player, getPlayerArmorValue(game)));
  if (!game.player.alive) {
    game.status = "lost";
    game.log.push("You have fallen. Game over.");
  }
}

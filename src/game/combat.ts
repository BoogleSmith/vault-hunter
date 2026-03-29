import { ARMOR } from "./data";
import { addHealth, nextInt } from "./mechanics";
import {
  checkVictory,
  getAvailableDirections,
  getCurrentRoom,
  movePlayer,
} from "./map";
import type { ArmorKey, DirectionKey, Game, UnitBase } from "./types";

function checkEvade(
  target: { agility: number; armor: ArmorKey },
  attackerDexterity: number,
): boolean {
  const armor = ARMOR[target.armor].constant;
  const effectiveAgility = Math.floor(target.agility / armor);
  const randomDodge = nextInt(0, Math.max(effectiveAgility, 0));
  const randomHit = nextInt(0, Math.max(attackerDexterity, 0));
  return randomDodge < randomHit;
}

function calculateDamage(
  source: { damageMax: number; damageBase: number },
  target: { armor: ArmorKey },
): number {
  const armor = ARMOR[target.armor].constant;
  const roll = nextInt(source.damageMax, source.damageBase);
  return Math.max(1, Math.round(roll / armor));
}

function attack(
  source: { name: string } & UnitBase & {
      dexterity: number;
      damageBase: number;
      damageMax: number;
    },
  target: { name: string } & UnitBase & { armor: ArmorKey; agility: number },
): string {
  if (!source.alive || !target.alive) {
    return `${source.name || "Unit"} cannot attack right now.`;
  }

  const hit = checkEvade(target, source.dexterity);
  if (!hit) {
    return `${source.name} misses ${target.name}.`;
  }

  const damage = calculateDamage(source, target);
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

  game.log.push(attack(game.player, room.enemy));
  if (room.enemy.alive) {
    game.log.push(attack(room.enemy, game.player));
  } else {
    // Enemy just died — collect any dropped items
    for (const item of room.enemy.inventory) {
      game.player.inventory.push(item);
      game.log.push(`You found ${item.label} on the body!`);
    }
    room.enemy.inventory = [];
  }
  if (!game.player.alive) {
    game.status = "lost";
    game.log.push("You have fallen. Game over.");
  }

  checkVictory(game);
}

export function tryFlee(game: Game): void {
  const room = getCurrentRoom(game);
  if (!room.enemy.alive) {
    game.log.push("There is nothing to flee from.");
    return;
  }

  const escaped = !checkEvade(game.player, room.enemy.dexterity);
  if (!escaped) {
    game.log.push(`${game.player.name} failed to escape!`);
    game.log.push(attack(room.enemy, game.player));
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
  const directionKey = options[nextInt(0, options.length - 1)];

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

  game.log.push(attack(room.enemy, game.player));
  if (!game.player.alive) {
    game.status = "lost";
    game.log.push("You have fallen. Game over.");
  }
}

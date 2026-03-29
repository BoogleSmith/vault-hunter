import type { UnitBase } from "./types";

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

import { PLAYER_CLASSES } from "../../../game/data";
import type { Game } from "../../../game/engine";
import { HealthBar } from "../../shared/components/HealthBar";

function getTotalArmorValue(game: Game): number {
  const equippedIds = new Set(
    Object.values(game.player.equipment).filter(
      (id): id is number => id !== undefined,
    ),
  );

  let total = 0;
  for (const item of game.player.inventory) {
    if (
      item.instanceId === undefined ||
      !equippedIds.has(item.instanceId) ||
      !item.armorValue
    ) {
      continue;
    }
    total += item.armorValue;
  }

  return Math.max(0, total);
}

interface StatusPanelProps {
  game: Game;
  onReset: () => void;
  onOpenEquipment: () => void;
  showEnemyDebug: boolean;
  onToggleEnemyDebug: () => void;
}

export function StatusPanel({
  game,
  onReset,
  onOpenEquipment,
  showEnemyDebug,
  onToggleEnemyDebug,
}: StatusPanelProps) {
  const armorValue = getTotalArmorValue(game);

  return (
    <section className="panel status">
      <p className="kicker">
        {game.status === "playing"
          ? "In Progress"
          : game.status === "won"
            ? "Victory"
            : "Defeat"}
      </p>
      <h1>Vault Hunter</h1>
      <p>
        {game.player.name} the {PLAYER_CLASSES[game.player.classKey].label}
      </p>
      <div className="stats-grid">
        <div>
          <span>HP:</span>
          <HealthBar current={game.player.health} max={game.player.healthMax} />
        </div>
        <span>
          Damage: {game.player.damageBase}-{game.player.damageMax}
        </span>
        <span>Agility: {game.player.agility}</span>
        <span>Dexterity: {game.player.dexterity}</span>
        <span>Armor: +{armorValue.toFixed(2)}</span>
        <span>
          Location: {game.currentX},{game.currentY}
        </span>
      </div>
      <button className="eq-open-btn" onClick={onOpenEquipment}>
        ⚔ Equipment
      </button>
      <div className="debug-controls">
        <label className="debug-toggle">
          <input
            type="checkbox"
            checked={showEnemyDebug}
            onChange={onToggleEnemyDebug}
          />
          <span>Show Enemy Positions</span>
        </label>
      </div>
      <button className="ghost" onClick={onReset}>
        New Run
      </button>
    </section>
  );
}

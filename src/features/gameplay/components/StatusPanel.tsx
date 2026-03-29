import { ARMOR, PLAYER_CLASSES } from "../../../game/data";
import type { Game } from "../../../game/engine";
import { HealthBar } from "../../shared/components/HealthBar";

interface StatusPanelProps {
  game: Game;
  onReset: () => void;
  showEnemyDebug: boolean;
  onToggleEnemyDebug: () => void;
}

export function StatusPanel({
  game,
  onReset,
  showEnemyDebug,
  onToggleEnemyDebug,
}: StatusPanelProps) {
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
        <span>Armor: {ARMOR[game.player.armor].label}</span>
        <span>
          Location: {game.currentX},{game.currentY}
        </span>
      </div>
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

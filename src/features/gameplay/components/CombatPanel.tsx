import { PLAYER_CLASSES } from "../../../game/data";
import type { Enemy, Player } from "../../../game/types";
import "../../shared/components/controls.css";
import "./CombatPanel.css";
import { HealthBar } from "../../shared/components/HealthBar";

interface CombatPanelProps {
  player: Player;
  enemy: Enemy;
  onAttack: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
  isPlaying: boolean;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="combat-stat-row">
      <span className="combat-stat-label">{label}</span>
      <span className="combat-stat-value">{value}</span>
    </div>
  );
}

export function CombatPanel({
  player,
  enemy,
  onAttack,
  onFlee,
  onOpenInventory,
  isPlaying,
}: CombatPanelProps) {
  const classLabel = PLAYER_CLASSES[player.classKey].label;

  return (
    <div className="combat-panel">
      <p className="combat-panel__heading">Combat</p>

      <div className="combat-arena">
        {/* Player card */}
        <div className="combatant-card combatant-card--player">
          <div className="combatant-portrait combatant-portrait--player">
            <span className="combatant-portrait__placeholder">🧙</span>
          </div>
          <div className="combatant-body">
            <div className="combatant-name-row">
              <span className="combatant-name">{player.name}</span>
              <span className="combatant-class">{classLabel}</span>
            </div>
            <HealthBar current={player.health} max={player.healthMax} />
            <div className="combat-stats">
              <StatRow
                label="DMG"
                value={`${player.damageBase}–${player.damageMax}`}
              />
              <StatRow label="AGI" value={player.agility} />
              <StatRow label="DEX" value={player.dexterity} />
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="combat-vs" aria-hidden="true">
          <span>VS</span>
        </div>

        {/* Enemy card */}
        <div className="combatant-card combatant-card--enemy">
          <div className="combatant-portrait combatant-portrait--enemy">
            <span className="combatant-portrait__placeholder">👹</span>
          </div>
          <div className="combatant-body">
            <div className="combatant-name-row">
              <span className="combatant-name">{enemy.name}</span>
            </div>
            <HealthBar current={enemy.health} max={enemy.healthMax} />
            <div className="combat-stats">
              <StatRow
                label="DMG"
                value={`${enemy.damageBase}–${enemy.damageMax}`}
              />
              <StatRow label="AGI" value={enemy.agility} />
              <StatRow label="ARM" value={enemy.armor.toFixed(2)} />
            </div>
          </div>
        </div>
      </div>

      <div className="combat-actions">
        <button onClick={onAttack} disabled={!isPlaying}>
          ⚔ Attack
        </button>
        <button
          className="ghost"
          onClick={onOpenInventory}
          disabled={!isPlaying}
        >
          💼 Inventory
        </button>
        <button className="ghost" onClick={onFlee} disabled={!isPlaying}>
          🏃 Flee
        </button>
      </div>
    </div>
  );
}

import type { Enemy } from "../../../game/types";
import { HealthBar } from "../../shared/components/HealthBar";

interface EncounterPanelProps {
  enemy: Enemy;
  onAttack: () => void;
  onFlee: () => void;
  isPlaying: boolean;
}

export function EncounterPanel({
  enemy,
  onAttack,
  onFlee,
  isPlaying,
}: EncounterPanelProps) {
  return (
    <div className="monster">
      <h2>Monster</h2>
      <div className="encounter">
        <h3>{enemy.name}</h3>
        <p>{enemy.description}</p>
        <div>
          <span>Enemy HP:</span>
          <HealthBar current={enemy.health} max={enemy.healthMax} />
        </div>
      </div>

      <p className="actions-label">Combat</p>
      <div className="combat-actions">
        <button onClick={onAttack} disabled={!isPlaying}>
          ⚔ Attack
        </button>
        <button className="ghost" onClick={onFlee} disabled={!isPlaying}>
          🏃 Flee
        </button>
      </div>
    </div>
  );
}

import type { Enemy } from "../../../game/types";
import { HealthBar } from "../../shared/components/HealthBar";

interface MonsterPanelProps {
  enemy: Enemy;
}

export function MonsterPanel({ enemy }: MonsterPanelProps) {
  return (
    <section className="panel monster">
      <h2>Monster</h2>
      {enemy.alive ? (
        <div className="encounter">
          <h3>{enemy.name}</h3>
          <p>{enemy.description}</p>
          <div>
            <span>Enemy HP:</span>
            <HealthBar current={enemy.health} max={enemy.healthMax} />
          </div>
        </div>
      ) : (
        <p className="cleared">No active threat in this room.</p>
      )}
    </section>
  );
}

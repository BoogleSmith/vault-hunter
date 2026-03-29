import { PLAYER_CLASSES } from "../../../game/data";
import type { Game } from "../../../game/engine";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./StatusPanel.css";
import { HealthBar } from "../../shared/components/HealthBar";

interface StatusPanelProps {
  game: Game;
  onReset: () => void;
  onOpenEquipment: () => void;
}

export function StatusPanel({
  game,
  onReset,
  onOpenEquipment,
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
          Location: {game.currentX},{game.currentY}
        </span>
      </div>
      <button className="eq-open-btn" onClick={onOpenEquipment}>
        ⚔ Equipment
      </button>
      <button className="ghost" onClick={onReset}>
        New Run
      </button>
    </section>
  );
}

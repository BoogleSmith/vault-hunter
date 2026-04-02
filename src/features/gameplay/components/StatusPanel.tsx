import { PLAYER_CLASSES } from "../../../game/data";
import type { Game } from "../../../game/engine";
import { getExperienceToNextLevel } from "../../../game/player";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./StatusPanel.css";
import { HealthBar } from "../../shared/components/HealthBar";
import { ExpandedMap } from "./ExpandedMap";
import { ExperienceBar } from "../../shared/components/ExperienceBar";

interface StatusPanelProps {
  game: Game;
  onOpenEquipment: () => void;
}

export function StatusPanel({ game, onOpenEquipment }: StatusPanelProps) {
  const xpToNext = getExperienceToNextLevel(game.player);

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
          <HealthBar current={game.player.health} max={game.player.healthMax} />
        </div>
        <div>
          <ExperienceBar current={game.player.experience} max={xpToNext} />
        </div>
        <span>
          Location: {game.currentX},{game.currentY}
        </span>
      </div>
      <button className="eq-open-btn" onClick={onOpenEquipment}>
        💼 Inventory
      </button>
    </section>
  );
}

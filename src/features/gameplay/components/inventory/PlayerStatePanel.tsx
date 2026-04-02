import { PLAYER_CLASSES } from "../../../../game/data";
import type { Game } from "../../../../game/engine";
import "./PlayerStatePanel.css";

interface PlayerStatePanelProps {
  game: Game;
  armorValue: number;
}

export function PlayerStatePanel({ game, armorValue }: PlayerStatePanelProps) {
  return (
    <div className="eq-player-state">
      <h3>Player State</h3>
      <div className="eq-state-grid">
        <div className="eq-state-row">
          <span className="eq-state-label">Class</span>
          <span className="eq-state-value">
            {PLAYER_CLASSES[game.player.classKey].label}
          </span>
        </div>
        <div className="eq-state-row">
          <span className="eq-state-label">Health</span>
          <span className="eq-state-value">
            {game.player.health}/{game.player.healthMax}
          </span>
        </div>
        <div className="eq-state-row">
          <span className="eq-state-label">Damage</span>
          <span className="eq-state-value">
            {game.player.damageBase}-{game.player.damageMax}
          </span>
        </div>
        <div className="eq-state-row">
          <span className="eq-state-label">Agility</span>
          <span className="eq-state-value">{game.player.agility}</span>
        </div>
        <div className="eq-state-row">
          <span className="eq-state-label">Dexterity</span>
          <span className="eq-state-value">{game.player.dexterity}</span>
        </div>
        <div className="eq-state-row">
          <span className="eq-state-label">Armor</span>
          <span className="eq-state-value">+{armorValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

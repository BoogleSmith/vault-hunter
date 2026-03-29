import { ARMOR, PLAYER_CLASSES } from "../../../game/data";
import type { Game } from "../../../game/engine";

interface FinalStatsProps {
  game: Game;
}

export function FinalStats({ game }: FinalStatsProps) {
  return (
    <div className="final-stats">
      <p>
        <strong>Class:</strong> {PLAYER_CLASSES[game.player.classKey].label}
      </p>
      <p>
        <strong>Armor:</strong> {ARMOR[game.player.armor].label}
      </p>
      <p>
        <strong>Final Health:</strong> {Math.max(0, game.player.health)}/
        {game.player.healthMax}
      </p>
      <p>
        <strong>Position:</strong> {game.currentX},{game.currentY}
      </p>
      <p>
        <strong>Rooms Explored:</strong>{" "}
        {game.map.flat().filter((room) => room.discovered).length}/
        {game.map.length * game.map[0].length}
      </p>
    </div>
  );
}

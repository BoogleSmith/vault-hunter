import { PLAYER_CLASSES } from "../../../game/data";
import type { Game } from "../../../game/engine";
import "./FinalStats.css";

interface FinalStatsProps {
  game: Game;
}

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

export function FinalStats({ game }: FinalStatsProps) {
  const armorValue = getTotalArmorValue(game);

  return (
    <div className="final-stats">
      <p>
        <strong>Class:</strong> {PLAYER_CLASSES[game.player.classKey].label}
      </p>
      <p>
        <strong>Armor:</strong> +{armorValue.toFixed(2)}
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
        {game.map.length * (game.map[0]?.length ?? 0)}
      </p>
      <p>
        <strong>Items Collected:</strong> {game.player.inventory.length}
        {game.player.inventory.length > 0 && (
          <span className="final-items">
            {" "}
            ({game.player.inventory.map((i) => i.label).join(", ")})
          </span>
        )}
      </p>
    </div>
  );
}

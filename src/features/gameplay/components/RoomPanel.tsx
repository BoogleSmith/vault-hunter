import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./RoomPanel.css";
import { CombatPanel } from "./CombatPanel";
import { getRoomMeta, type Game, type Room } from "../../../game/engine";

interface RoomPanelProps {
  game: Game;
  currentRoom: Room;
  inEncounter: boolean;
  onAttack: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
}

export function RoomPanel({
  game,
  currentRoom,
  inEncounter,
  onAttack,
  onFlee,
  onOpenInventory,
}: RoomPanelProps) {
  const roomMeta = getRoomMeta(currentRoom);
  const isPlaying = game.status === "playing";

  return (
    <section className="panel room">
      <h2>{roomMeta.key}</h2>
      <p>{roomMeta.description}</p>

      {inEncounter && currentRoom.enemy.alive && (
        <CombatPanel
          player={game.player}
          enemy={currentRoom.enemy}
          onAttack={onAttack}
          onFlee={onFlee}
          onOpenInventory={onOpenInventory}
          isPlaying={isPlaying}
        />
      )}
    </section>
  );
}

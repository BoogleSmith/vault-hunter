import type { DirectionKey } from "../../game/data";
import type { Game, Room } from "../../game/engine";
import { AdventureLogPanel } from "./components/AdventureLogPanel";
import { InventoryPanel } from "./components/InventoryPanel";
import { MonsterPanel } from "./components/MonsterPanel";
import { RoomPanel } from "./components/RoomPanel";
import { StatusPanel } from "./components/StatusPanel";

interface GameplayPageProps {
  game: Game;
  currentRoom: Room;
  availableDirections: Record<DirectionKey, boolean>;
  inEncounter: boolean;
  onMove: (direction: DirectionKey) => void;
  onAttack: () => void;
  onFlee: () => void;
  onReset: () => void;
  onUseItem: (index: number) => void;
}

export function GameplayPage({
  game,
  currentRoom,
  availableDirections,
  inEncounter,
  onMove,
  onAttack,
  onFlee,
  onReset,
  onUseItem,
}: GameplayPageProps) {
  return (
    <main className="shell in-game">
      <StatusPanel game={game} onReset={onReset} />
      <RoomPanel
        game={game}
        currentRoom={currentRoom}
        availableDirections={availableDirections}
        inEncounter={inEncounter}
        onMove={onMove}
        onAttack={onAttack}
        onFlee={onFlee}
      />
      <AdventureLogPanel log={game.log} />
      <MonsterPanel enemy={currentRoom.enemy} />
      <InventoryPanel
        inventory={game.player.inventory}
        playerHealth={game.player.health}
        playerHealthMax={game.player.healthMax}
        itemCooldowns={game.player.itemCooldowns}
        onUseItem={onUseItem}
      />
    </main>
  );
}

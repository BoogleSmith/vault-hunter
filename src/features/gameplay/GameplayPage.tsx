import { useState } from "react";
import type { DirectionKey } from "../../game/data";
import type { Game, ItemSlot, Room } from "../../game/engine";
import { EquipmentModal } from "./components/EquipmentModal";
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
  onEquipItem: (index: number) => void;
  onUnequipSlot: (slot: ItemSlot) => void;
  showEnemyDebug: boolean;
  onToggleEnemyDebug: () => void;
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
  onEquipItem,
  onUnequipSlot,
  showEnemyDebug,
  onToggleEnemyDebug,
}: GameplayPageProps) {
  const [showEquipModal, setShowEquipModal] = useState(false);

  return (
    <main className="shell in-game">
      <StatusPanel
        game={game}
        onReset={onReset}
        onOpenEquipment={() => setShowEquipModal(true)}
        showEnemyDebug={showEnemyDebug}
        onToggleEnemyDebug={onToggleEnemyDebug}
      />
      {showEquipModal && (
        <EquipmentModal
          game={game}
          onClose={() => setShowEquipModal(false)}
          onUnequipSlot={(slot) => {
            onUnequipSlot(slot);
          }}
        />
      )}
      <RoomPanel
        game={game}
        currentRoom={currentRoom}
        availableDirections={availableDirections}
        inEncounter={inEncounter}
        onMove={onMove}
        onAttack={onAttack}
        onFlee={onFlee}
        showEnemyDebug={showEnemyDebug}
      />
      <AdventureLogPanel log={game.log} />
      <MonsterPanel enemy={currentRoom.enemy} />
      <InventoryPanel
        inventory={game.player.inventory}
        equipment={game.player.equipment}
        playerHealth={game.player.health}
        playerHealthMax={game.player.healthMax}
        itemCooldowns={game.player.itemCooldowns}
        onUseItem={onUseItem}
        onEquipItem={onEquipItem}
      />
    </main>
  );
}

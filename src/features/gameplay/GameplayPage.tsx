import { useState } from "react";
import "../shared/components/shell.css";
import "../shared/components/surface.css";
import "./GameplayPage.css";
import type { DirectionKey } from "../../game/data";
import type { Game, ItemSlot, Room } from "../../game/engine";
import { EquipmentModal } from "./components/inventory";
import { AdventureLogPanel } from "./components/AdventureLogPanel";
import { RoomPanel } from "./components/RoomPanel";
import { StatusPanel } from "./components/StatusPanel";
import { DebugMenu } from "./components/DebugMenu";
import { ExplorePanel } from "./components/ExplorePanel";

interface GameplayPageProps {
  game: Game;
  currentRoom: Room;
  availableDirections: Record<DirectionKey, boolean>;
  inEncounter: boolean;
  onMove: (direction: DirectionKey) => void;
  onWait: () => void;
  onAttack: () => void;
  onFlee: () => void;
  onReset: () => void;
  onUseItem: (index: number) => void;
  onEquipItem: (index: number) => void;
  onUnequipSlot: (slot: ItemSlot) => void;
  showEnemyDebug: boolean;
  onToggleEnemyDebug: () => void;
  onForceVictory: () => void;
  onForceDeath: () => void;
}

export function GameplayPage({
  game,
  currentRoom,
  availableDirections,
  inEncounter,
  onMove,
  onWait,
  onAttack,
  onFlee,
  onReset,
  onUseItem,
  onEquipItem,
  onUnequipSlot,
  showEnemyDebug,
  onToggleEnemyDebug,
  onForceVictory,
  onForceDeath,
}: GameplayPageProps) {
  const [showEquipModal, setShowEquipModal] = useState(false);

  return (
    <main className={`shell ${inEncounter ? "in-combat" : "in-game"}`}>
      {!inEncounter && (
        <section className="hud-column">
          <StatusPanel
            game={game}
            onOpenEquipment={() => setShowEquipModal(true)}
          />
        </section>
      )}
      {showEquipModal && (
        <EquipmentModal
          game={game}
          onClose={() => setShowEquipModal(false)}
          onUseItem={onUseItem}
          onEquipItem={onEquipItem}
          onUnequipSlot={(slot) => {
            onUnequipSlot(slot);
          }}
        />
      )}
      <section className={inEncounter ? "combat-column" : "room-column"}>
        <RoomPanel
          game={game}
          currentRoom={currentRoom}
          inEncounter={inEncounter}
          onAttack={onAttack}
          onFlee={onFlee}
          onOpenInventory={() => setShowEquipModal(true)}
        />
      </section>
      {!inEncounter && (
        <section className="explore-column">
          <ExplorePanel
            game={game}
            availableDirections={availableDirections}
            onMove={onMove}
            onWait={onWait}
            showEnemyDebug={showEnemyDebug}
          />
        </section>
      )}
      <AdventureLogPanel log={game.log} />
      <button className="exit-fab" onClick={onReset}>
        ← Exit
      </button>
      <DebugMenu
        canForceOutcome={game.status === "playing"}
        showEnemyDebug={showEnemyDebug}
        onToggleEnemyDebug={onToggleEnemyDebug}
        onForceVictory={onForceVictory}
        onForceDeath={onForceDeath}
      />
    </main>
  );
}

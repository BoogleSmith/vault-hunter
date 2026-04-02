import { useEffect, useState } from "react";
import "../../../shared/components/controls.css";
import "./EquipmentModal.css";
import type { Item, ItemSlot } from "../../../../game/engine";
import { SLOT_CONFIGS } from "./constants";
import { EquipmentInfoPanel } from "./EquipmentInfoPanel";
import { EquipmentSlotGrid } from "./EquipmentSlotGrid";
import { InventoryList } from "./InventoryList";
import { PlayerStatePanel } from "./PlayerStatePanel";
import type { EquipmentModalProps } from "./types";
import { buildRows, getTotalArmorValue } from "./utils";

export function EquipmentModal({
  game,
  onClose,
  onUseItem,
  onEquipItem,
  onUnequipSlot,
}: EquipmentModalProps) {
  const [inspectedSlot, setInspectedSlot] = useState<ItemSlot | null>(null);
  const [inspectedInventoryId, setInspectedInventoryId] = useState<
    string | null
  >(null);

  const equippedIds = new Set(
    Object.values(game.player.equipment).filter(
      (id): id is string => id !== undefined,
    ),
  );

  const visibleInventoryEntries = game.player.inventory
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !equippedIds.has(item.instanceId));

  const rows = buildRows(visibleInventoryEntries);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function getEquippedItem(slot: ItemSlot): Item | undefined {
    const instanceId = game.player.equipment[slot];
    if (instanceId === undefined) return undefined;
    return game.player.inventory.find(
      (entry) => entry.instanceId === instanceId,
    );
  }

  const hoveredItem = inspectedSlot
    ? getEquippedItem(inspectedSlot)
    : undefined;
  const hoveredConfig = inspectedSlot
    ? SLOT_CONFIGS.find((config) => config.slot === inspectedSlot)
    : undefined;
  const hoveredInventoryItem =
    inspectedInventoryId !== null
      ? game.player.inventory.find(
          (item) => item.instanceId === inspectedInventoryId,
        )
      : undefined;

  const armorValue = getTotalArmorValue(game);

  return (
    <div
      className="eq-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Equipment"
    >
      <div className="eq-modal" onClick={(event) => event.stopPropagation()}>
        <div className="eq-modal-header">
          <h2>Equipment</h2>
          <button
            className="ghost eq-close-btn"
            onClick={onClose}
            aria-label="Close equipment"
          >
            ✕
          </button>
        </div>

        <div className="eq-content-left">
          <div className="eq-doll-wrap">
            <EquipmentSlotGrid
              slotConfigs={SLOT_CONFIGS}
              getEquippedItem={getEquippedItem}
              onUnequipSlot={onUnequipSlot}
              onInspectSlot={setInspectedSlot}
            />
          </div>

          <InventoryList
            rows={rows}
            inventory={game.player.inventory}
            equipment={game.player.equipment}
            itemCooldowns={game.player.itemCooldowns}
            playerHealth={game.player.health}
            playerHealthMax={game.player.healthMax}
            onEquipItem={onEquipItem}
            onUseItem={onUseItem}
            onInspectInventoryItem={setInspectedInventoryId}
          />
        </div>

        <div className="eq-content-right">
          <EquipmentInfoPanel
            hoveredInventoryItem={hoveredInventoryItem}
            hoveredItem={hoveredItem}
            hoveredSlotLabel={hoveredConfig?.label}
          />
          <PlayerStatePanel game={game} armorValue={armorValue} />
        </div>
      </div>
    </div>
  );
}

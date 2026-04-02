import type { CSSProperties } from "react";
import type { Item, ItemSlot } from "../../../../game/engine";
import type { SlotConfig } from "./types";
import "./EquipmentSlotGrid.css";

interface EquipmentSlotGridProps {
  slotConfigs: SlotConfig[];
  getEquippedItem: (slot: ItemSlot) => Item | undefined;
  onUnequipSlot: (slot: ItemSlot) => void;
  onInspectSlot: (slot: ItemSlot) => void;
}

export function EquipmentSlotGrid({
  slotConfigs,
  getEquippedItem,
  onUnequipSlot,
  onInspectSlot,
}: EquipmentSlotGridProps) {
  return (
    <div className="eq-slot-grid">
      <svg
        className="eq-body-svg"
        viewBox="0 0 60 90"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="30" cy="10" r="8" />
        <line x1="30" y1="18" x2="30" y2="22" />
        <rect x="18" y="22" width="24" height="28" rx="4" />
        <line x1="18" y1="27" x2="5" y2="48" />
        <line x1="42" y1="27" x2="55" y2="48" />
        <line x1="24" y1="50" x2="20" y2="80" />
        <line x1="36" y1="50" x2="40" y2="80" />
      </svg>

      {slotConfigs.map(({ slot, icon, label, row, col }) => {
        const item = getEquippedItem(slot);
        const filled = item !== undefined;

        return (
          <button
            key={slot}
            className={`eq-slot ${filled ? "eq-slot--filled" : "eq-slot--empty"}`}
            style={{ gridRow: row, gridColumn: col } as CSSProperties}
            onClick={() => filled && onUnequipSlot(slot)}
            onMouseEnter={() => onInspectSlot(slot)}
            aria-label={`${label}: ${item?.label ?? "Empty"}`}
          >
            <span className="eq-slot-icon">{icon}</span>
            <span className="eq-slot-name">{label}</span>
            {filled && <span className="eq-slot-item">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

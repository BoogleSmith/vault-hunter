import { useEffect, useState } from "react";
import type { Game, Item, ItemSlot } from "../../../game/engine";

interface SlotConfig {
  slot: ItemSlot;
  icon: string;
  label: string;
  row: number;
  col: number;
}

const SLOT_CONFIGS: SlotConfig[] = [
  { slot: "head", icon: "🪖", label: "Head", row: 1, col: 2 },
  { slot: "leftHand", icon: "🗡️", label: "L. Hand", row: 2, col: 1 },
  { slot: "chest", icon: "🛡️", label: "Chest", row: 2, col: 2 },
  { slot: "rightHand", icon: "⚔️", label: "R. Hand", row: 2, col: 3 },
  { slot: "leftAccessory", icon: "💍", label: "L. Ring", row: 3, col: 1 },
  { slot: "back", icon: "🧥", label: "Back", row: 3, col: 2 },
  { slot: "rightAccessory", icon: "💍", label: "R. Ring", row: 3, col: 3 },
];

const TYPE_ICON: Record<Item["type"], string> = {
  potion: "🧪",
  weapon: "⚔️",
  accessory: "💍",
  relic: "🗿",
};

function formatEffect(effect: Item["effect"]): string {
  const parts: string[] = [];
  if (effect.healthMax) parts.push(`+${effect.healthMax} max HP`);
  if (effect.health) parts.push(`+${effect.health} HP`);
  if (effect.damageBase) parts.push(`+${effect.damageBase} min dmg`);
  if (effect.damageMax) parts.push(`+${effect.damageMax} max dmg`);
  if (effect.agility) parts.push(`+${effect.agility} agility`);
  if (effect.dexterity) parts.push(`+${effect.dexterity} dexterity`);
  return parts.join("  ·  ");
}

interface EquipmentModalProps {
  game: Game;
  onClose: () => void;
  onUnequipSlot: (slot: ItemSlot) => void;
}

export function EquipmentModal({
  game,
  onClose,
  onUnequipSlot,
}: EquipmentModalProps) {
  const [hoveredSlot, setHoveredSlot] = useState<ItemSlot | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function getEquippedItem(slot: ItemSlot): Item | undefined {
    const instanceId = game.player.equipment[slot];
    if (instanceId === undefined) return undefined;
    return game.player.inventory.find((e) => e.instanceId === instanceId);
  }

  const hoveredItem = hoveredSlot ? getEquippedItem(hoveredSlot) : undefined;
  const hoveredConfig = hoveredSlot
    ? SLOT_CONFIGS.find((c) => c.slot === hoveredSlot)
    : undefined;

  return (
    <div
      className="eq-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Equipment"
    >
      <div className="eq-modal" onClick={(e) => e.stopPropagation()}>
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

        <div className="eq-doll-wrap">
          <div className="eq-slot-grid">
            {/* Decorative body silhouette, positioned absolute inside the grid */}
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

            {SLOT_CONFIGS.map(({ slot, icon, label, row, col }) => {
              const item = getEquippedItem(slot);
              const filled = item !== undefined;

              return (
                <button
                  key={slot}
                  className={`eq-slot ${filled ? "eq-slot--filled" : "eq-slot--empty"}`}
                  style={{ gridRow: row, gridColumn: col }}
                  onClick={() => filled && onUnequipSlot(slot)}
                  onMouseEnter={() => setHoveredSlot(slot)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  aria-label={`${label}: ${item?.label ?? "Empty"}`}
                >
                  <span className="eq-slot-icon">{icon}</span>
                  <span className="eq-slot-name">{label}</span>
                  {filled && (
                    <span className="eq-slot-item">{item!.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hover detail panel */}
        <div className="eq-info-panel">
          {hoveredConfig ? (
            hoveredItem ? (
              <div className="eq-info-filled">
                <span className="eq-info-icon">
                  {TYPE_ICON[hoveredItem.type]}
                </span>
                <div className="eq-info-content">
                  <strong className="eq-info-name">{hoveredItem.label}</strong>
                  <p className="eq-info-desc">{hoveredItem.description}</p>
                  {formatEffect(hoveredItem.effect) && (
                    <span className="eq-info-effect">
                      {formatEffect(hoveredItem.effect)}
                    </span>
                  )}
                  <em className="eq-info-hint">Click slot to unequip</em>
                </div>
              </div>
            ) : (
              <p className="eq-info-empty">
                <strong>{hoveredConfig.label}</strong> — Empty slot
              </p>
            )
          ) : (
            <p className="eq-info-placeholder">
              Hover a slot to see item details
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

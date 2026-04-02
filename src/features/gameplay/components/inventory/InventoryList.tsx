import type { Item, ItemKey, ItemSlot } from "../../../../game/engine";
import { getItemRarityMeta } from "../../../shared/components/itemRarity";
import { EffectText } from "./EffectText";
import { REQUIREMENT_LABELS, TYPE_ICON } from "./constants";
import type { DisplayRow } from "./types";
import "./ItemMeta.css";
import "./InventoryList.css";

interface InventoryListProps {
  rows: DisplayRow[];
  inventory: Item[];
  equipment: Partial<Record<ItemSlot, string>>;
  itemCooldowns: Partial<Record<ItemKey, number>>;
  playerHealth: number;
  playerHealthMax: number;
  onEquipItem: (index: number) => void;
  onUseItem: (index: number) => void;
  onInspectInventoryItem: (instanceId: string | null) => void;
}

export function InventoryList({
  rows,
  inventory,
  equipment,
  itemCooldowns,
  playerHealth,
  playerHealthMax,
  onEquipItem,
  onUseItem,
  onInspectInventoryItem,
}: InventoryListProps) {
  return (
    <div className="eq-inventory">
      <h3>Inventory</h3>
      {rows.length === 0 ? (
        <p className="eq-inv-empty">Nothing collected yet.</p>
      ) : (
        <ul className="eq-inv-list">
          {rows.map(({ item, count, indices }) => {
            const rarity = getItemRarityMeta(item.rarity);
            const equipSlots = item.equipSlots ?? [];
            const isPureHeal =
              !!item.effect.health &&
              Object.keys(item.effect).every((k) => k === "health");
            const useIndex =
              indices.find(
                (idx) => (inventory[idx]?.cooldownRemaining ?? 0) <= 0,
              ) ?? indices[0];
            const selected =
              useIndex !== undefined ? inventory[useIndex] : item;
            const cd = item.sharedCooldown
              ? (itemCooldowns[item.key] ?? 0)
              : (selected?.cooldownRemaining ?? 0);

            const equipIndex = indices[0];
            const isEquipped = Object.values(equipment).includes(
              item.instanceId,
            );

            const slotSummary =
              equipSlots.length > 0
                ? equipSlots.map((slot) => REQUIREMENT_LABELS[slot]).join(", ")
                : "";

            return (
              <li
                key={`${item.key}-${indices[0] ?? 0}`}
                className={`eq-inv-item eq-inv-item--r${rarity.tier}`}
                onMouseEnter={() => onInspectInventoryItem(item.instanceId)}
                onMouseLeave={() => onInspectInventoryItem(null)}
              >
                <span className="eq-inv-main">
                  <span className="eq-inv-icon">{TYPE_ICON[item.type]}</span>
                  <span className="eq-inv-text">
                    <strong className="eq-item-name">
                      <span className="eq-item-label">{item.label}</span>
                      {count > 1 && (
                        <span className="eq-inv-count"> x{count}</span>
                      )}
                    </strong>
                    <span className="eq-rarity-subtitle">{rarity.label}</span>
                    {slotSummary && (
                      <span className="eq-inv-slot-summary">{slotSummary}</span>
                    )}
                    <EffectText item={item} className="eq-inv-slot-summary" />
                  </span>
                </span>
                <span className="eq-inv-actions">
                  {equipSlots.length > 0 && equipIndex !== undefined && (
                    <button
                      className="ghost eq-inv-btn"
                      onClick={() => onEquipItem(equipIndex)}
                      disabled={isEquipped}
                    >
                      {isEquipped ? "On" : "Equip"}
                    </button>
                  )}
                  {item.usable && (
                    <button
                      className="eq-inv-btn"
                      onClick={() =>
                        useIndex !== undefined && onUseItem(useIndex)
                      }
                      disabled={
                        cd > 0 ||
                        (isPureHeal && playerHealth >= playerHealthMax)
                      }
                    >
                      {cd > 0 ? `${cd}` : "Use"}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

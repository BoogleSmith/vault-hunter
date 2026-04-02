import type {
  EquipRequirement,
  Item,
  ItemEffect,
  ItemKey,
  ItemSlot,
} from "../../../game/engine";
import { getItemRarityMeta } from "../../shared/components/itemRarity";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./InventoryPanel.css";

const SLOT_LABELS: Record<EquipRequirement, string> = {
  hand: "Hand",
  ring: "Ring",
  head: "Head",
  amulet: "Amulet",
  back: "Back",
  chest: "Chest",
  legs: "Legs",
};

const TYPE_ICON: Record<Item["type"], string> = {
  potion: "🧪",
  weapon: "⚔",
  accessory: "💍",
  armor: "🛡️",
  relic: "🗿",
};

function formatEffect(effect: ItemEffect): string {
  const parts: string[] = [];

  if (effect.healthMax) parts.push(`+${effect.healthMax} max HP`);
  if (effect.health) {
    // If healthMax is also set this is a permanent stat boost, not a heal
    parts.push(
      effect.healthMax
        ? `+${effect.health} HP`
        : `Restores ${effect.health} HP`,
    );
  }
  if (effect.damageBase) parts.push(`+${effect.damageBase} min dmg`);
  if (effect.damageMax) parts.push(`+${effect.damageMax} max dmg`);
  if (effect.agility) parts.push(`+${effect.agility} agility`);
  if (effect.dexterity) parts.push(`+${effect.dexterity} dexterity`);

  return parts.join(" · ");
}

interface DisplayRow {
  item: Item;
  count: number;
  indices: number[];
}

function buildRows(inventory: Item[]): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const stackIndex = new Map<string, number>(); // itemKey -> index in rows

  inventory.forEach((item, i) => {
    if (item.stackable) {
      const rowIdx = stackIndex.get(item.key);
      if (rowIdx !== undefined) {
        rows[rowIdx]!.count++;
        rows[rowIdx]!.indices.push(i);
      } else {
        stackIndex.set(item.key, rows.length);
        rows.push({ item, count: 1, indices: [i] });
      }
    } else {
      rows.push({ item, count: 1, indices: [i] });
    }
  });

  return rows;
}

interface InventoryPanelProps {
  inventory: Item[];
  equipment: Partial<Record<ItemSlot, number>>;
  playerHealth: number;
  playerHealthMax: number;
  itemCooldowns: Partial<Record<ItemKey, number>>;
  onUseItem: (index: number) => void;
  onEquipItem: (index: number) => void;
}

export function InventoryPanel({
  inventory,
  equipment,
  playerHealth,
  playerHealthMax,
  itemCooldowns,
  onUseItem,
  onEquipItem,
}: InventoryPanelProps) {
  const rows = buildRows(inventory);

  return (
    <section className="panel inventory">
      <h2>Inventory</h2>
      {rows.length === 0 ? (
        <p className="inv-empty">Nothing collected yet.</p>
      ) : (
        <ul className="inv-list">
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
            const isEquipped =
              item.instanceId !== undefined &&
              Object.values(equipment).includes(item.instanceId);
            const effectText = [
              item.armorValue ? `+${item.armorValue.toFixed(2)} armor` : "",
              formatEffect(item.effect),
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li
                key={`${item.key}-${indices[0] ?? 0}`}
                className={`inv-item inv-item--r${rarity.tier}`}
              >
                <span className="inv-icon">{TYPE_ICON[item.type]}</span>
                <span className="inv-info">
                  <strong className="inv-item-name">
                    <span className="inv-item-label">{item.label}</span>
                    {count > 1 && <span className="inv-count"> x{count}</span>}
                  </strong>
                  <span className="inv-rarity-subtitle">{rarity.label}</span>
                  <span className="inv-desc">{item.description}</span>
                  {equipSlots.length > 0 && (
                    <span className="inv-slots">
                      Slots:{" "}
                      {equipSlots.map((slot) => SLOT_LABELS[slot]).join(", ")}
                    </span>
                  )}
                  {effectText && (
                    <span className="inv-effect">{effectText}</span>
                  )}
                </span>
                <span className="inv-actions">
                  {equipSlots.length > 0 && equipIndex !== undefined && (
                    <button
                      className="inv-equip-btn ghost"
                      onClick={() => onEquipItem(equipIndex)}
                      disabled={isEquipped}
                    >
                      {isEquipped ? "Equipped" : "Equip"}
                    </button>
                  )}
                  {item.usable && (
                    <button
                      className="inv-use-btn"
                      onClick={() =>
                        useIndex !== undefined && onUseItem(useIndex)
                      }
                      disabled={
                        cd > 0 ||
                        (isPureHeal && playerHealth >= playerHealthMax)
                      }
                    >
                      {cd > 0 ? `${cd} room${cd !== 1 ? "s" : ""}` : "Use"}
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

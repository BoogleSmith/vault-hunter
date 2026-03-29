import { useEffect, useState } from "react";
import "../../shared/components/controls.css";
import "./EquipmentModal.css";
import type {
  EquipRequirement,
  Game,
  Item,
  ItemSlot,
} from "../../../game/engine";
import { PLAYER_CLASSES } from "../../../game/data";

interface SlotConfig {
  slot: ItemSlot;
  icon: string;
  label: string;
  row: number;
  col: number;
}

const SLOT_CONFIGS: SlotConfig[] = [
  { slot: "head", icon: "🪖", label: "Head", row: 1, col: 2 },
  { slot: "amulet", icon: "📿", label: "Amulet", row: 2, col: 2 },
  { slot: "leftHand", icon: "🗡️", label: "L. Hand", row: 3, col: 1 },
  { slot: "chest", icon: "🛡️", label: "Chest", row: 3, col: 2 },
  { slot: "rightHand", icon: "⚔️", label: "R. Hand", row: 3, col: 3 },
  { slot: "leftAccessory", icon: "💍", label: "L. Ring", row: 4, col: 1 },
  { slot: "back", icon: "🧥", label: "Back", row: 4, col: 2 },
  { slot: "rightAccessory", icon: "💍", label: "R. Ring", row: 4, col: 3 },
  { slot: "legs", icon: "👖", label: "Legs", row: 5, col: 2 },
];

const TYPE_ICON: Record<Item["type"], string> = {
  potion: "🧪",
  weapon: "⚔️",
  accessory: "💍",
  armor: "🛡️",
  relic: "🗿",
};

const REQUIREMENT_LABELS: Record<EquipRequirement, string> = {
  hand: "Hand",
  ring: "Ring",
  head: "Head",
  amulet: "Amulet",
  back: "Back",
  chest: "Chest",
  legs: "Legs",
};

interface DisplayRow {
  item: Item;
  count: number;
  indices: number[];
}

function buildRows(
  entries: Array<{ item: Item; index: number }>,
): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const stackIndex = new Map<string, number>();

  entries.forEach(({ item, index }) => {
    if (item.stackable) {
      const rowIdx = stackIndex.get(item.key);
      if (rowIdx !== undefined) {
        rows[rowIdx]!.count++;
        rows[rowIdx]!.indices.push(index);
      } else {
        stackIndex.set(item.key, rows.length);
        rows.push({ item, count: 1, indices: [index] });
      }
    } else {
      rows.push({ item, count: 1, indices: [index] });
    }
  });

  return rows;
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

function formatSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatEffect(effect: Item["effect"]): string {
  const parts: string[] = [];
  if (effect.healthMax)
    parts.push(`${formatSignedValue(effect.healthMax)} max HP`);
  if (effect.health) parts.push(`${formatSignedValue(effect.health)} HP`);
  if (effect.damageBase)
    parts.push(`${formatSignedValue(effect.damageBase)} min dmg`);
  if (effect.damageMax)
    parts.push(`${formatSignedValue(effect.damageMax)} max dmg`);
  if (effect.agility)
    parts.push(`${formatSignedValue(effect.agility)} agility`);
  if (effect.dexterity)
    parts.push(`${formatSignedValue(effect.dexterity)} dexterity`);
  return parts.join("  ·  ");
}

interface EquipmentModalProps {
  game: Game;
  onClose: () => void;
  onUseItem: (index: number) => void;
  onEquipItem: (index: number) => void;
  onUnequipSlot: (slot: ItemSlot) => void;
}

export function EquipmentModal({
  game,
  onClose,
  onUseItem,
  onEquipItem,
  onUnequipSlot,
}: EquipmentModalProps) {
  const [inspectedSlot, setInspectedSlot] = useState<ItemSlot | null>(null);
  const [inspectedInventoryId, setInspectedInventoryId] = useState<
    number | null
  >(null);
  const equippedIds = new Set(
    Object.values(game.player.equipment).filter(
      (id): id is number => id !== undefined,
    ),
  );
  const visibleInventoryEntries = game.player.inventory
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        item.instanceId === undefined || !equippedIds.has(item.instanceId),
    );
  const rows = buildRows(visibleInventoryEntries);

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

  const hoveredItem = inspectedSlot
    ? getEquippedItem(inspectedSlot)
    : undefined;
  const hoveredConfig = inspectedSlot
    ? SLOT_CONFIGS.find((c) => c.slot === inspectedSlot)
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

        {/* Left column: Doll + Inventory */}
        <div className="eq-content-left">
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
                    onMouseEnter={() => setInspectedSlot(slot)}
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

          <div className="eq-inventory">
            <h3>Inventory</h3>
            {rows.length === 0 ? (
              <p className="eq-inv-empty">Nothing collected yet.</p>
            ) : (
              <ul className="eq-inv-list">
                {rows.map(({ item, count, indices }) => {
                  const equipSlots = item.equipSlots ?? [];
                  const isPureHeal =
                    !!item.effect.health &&
                    Object.keys(item.effect).every((k) => k === "health");
                  const useIndex =
                    indices.find(
                      (idx) =>
                        (game.player.inventory[idx]?.cooldownRemaining ?? 0) <=
                        0,
                    ) ?? indices[0];
                  const selected =
                    useIndex !== undefined
                      ? game.player.inventory[useIndex]
                      : item;
                  const cd = item.sharedCooldown
                    ? (game.player.itemCooldowns[item.key] ?? 0)
                    : (selected?.cooldownRemaining ?? 0);

                  const equipIndex = indices[0];
                  const isEquipped =
                    item.instanceId !== undefined &&
                    Object.values(game.player.equipment).includes(
                      item.instanceId,
                    );

                  const slotSummary =
                    equipSlots.length > 0
                      ? equipSlots
                          .map((slot) => REQUIREMENT_LABELS[slot])
                          .join(", ")
                      : "";
                  const effectText = [
                    item.armorValue
                      ? `+${item.armorValue.toFixed(2)} armor`
                      : "",
                    formatEffect(item.effect),
                  ]
                    .filter(Boolean)
                    .join("  ·  ");

                  return (
                    <li
                      key={`${item.key}-${indices[0] ?? 0}`}
                      className="eq-inv-item"
                      onMouseEnter={() =>
                        setInspectedInventoryId(item.instanceId ?? null)
                      }
                      onMouseLeave={() => setInspectedInventoryId(null)}
                    >
                      <span className="eq-inv-main">
                        <span className="eq-inv-icon">
                          {TYPE_ICON[item.type]}
                        </span>
                        <span className="eq-inv-text">
                          <strong>
                            {item.label}
                            {count > 1 && (
                              <span className="eq-inv-count"> x{count}</span>
                            )}
                          </strong>
                          {slotSummary && (
                            <span className="eq-inv-slot-summary">
                              {slotSummary}
                            </span>
                          )}
                          {effectText && (
                            <span className="eq-inv-slot-summary">
                              {effectText}
                            </span>
                          )}
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
                              (isPureHeal &&
                                game.player.health >= game.player.healthMax)
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
        </div>

        {/* Right column: Info panel + Player state */}
        <div className="eq-content-right">
          {/* Item detail panel */}
          <div className="eq-info-panel">
            {hoveredInventoryItem ? (
              <div className="eq-info-filled">
                <span className="eq-info-icon">
                  {TYPE_ICON[hoveredInventoryItem.type]}
                </span>
                <div className="eq-info-content">
                  <strong className="eq-info-name">
                    {hoveredInventoryItem.label}
                  </strong>
                  <p className="eq-info-desc">
                    {hoveredInventoryItem.description}
                  </p>
                  {(hoveredInventoryItem.armorValue ||
                    formatEffect(hoveredInventoryItem.effect)) && (
                    <span className="eq-info-effect">
                      {[
                        hoveredInventoryItem.armorValue
                          ? `+${hoveredInventoryItem.armorValue.toFixed(2)} armor`
                          : "",
                        formatEffect(hoveredInventoryItem.effect),
                      ]
                        .filter(Boolean)
                        .join("  ·  ")}
                    </span>
                  )}
                  <em className="eq-info-hint">Inventory item preview</em>
                </div>
              </div>
            ) : hoveredConfig ? (
              hoveredItem ? (
                <div className="eq-info-filled">
                  <span className="eq-info-icon">
                    {TYPE_ICON[hoveredItem.type]}
                  </span>
                  <div className="eq-info-content">
                    <strong className="eq-info-name">
                      {hoveredItem.label}
                    </strong>
                    <p className="eq-info-desc">{hoveredItem.description}</p>
                    {(hoveredItem.armorValue ||
                      formatEffect(hoveredItem.effect)) && (
                      <span className="eq-info-effect">
                        {[
                          hoveredItem.armorValue
                            ? `+${hoveredItem.armorValue.toFixed(2)} armor`
                            : "",
                          formatEffect(hoveredItem.effect),
                        ]
                          .filter(Boolean)
                          .join("  ·  ")}
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

          {/* Player state menu */}
          <div className="eq-player-state">
            <h3>Player State</h3>
            <div className="eq-state-grid">
              <div className="eq-state-row">
                <span className="eq-state-label">Class</span>
                <span className="eq-state-value">
                  {PLAYER_CLASSES[game.player.classKey].label}
                </span>
              </div>
              <div className="eq-state-row">
                <span className="eq-state-label">Health</span>
                <span className="eq-state-value">
                  {game.player.health}/{game.player.healthMax}
                </span>
              </div>
              <div className="eq-state-row">
                <span className="eq-state-label">Damage</span>
                <span className="eq-state-value">
                  {game.player.damageBase}-{game.player.damageMax}
                </span>
              </div>
              <div className="eq-state-row">
                <span className="eq-state-label">Agility</span>
                <span className="eq-state-value">{game.player.agility}</span>
              </div>
              <div className="eq-state-row">
                <span className="eq-state-label">Dexterity</span>
                <span className="eq-state-value">{game.player.dexterity}</span>
              </div>
              <div className="eq-state-row">
                <span className="eq-state-label">Armor</span>
                <span className="eq-state-value">+{armorValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Fragment, useEffect, useState, type CSSProperties } from "react";
import "../../shared/components/controls.css";
import "./EquipmentModal.css";
import type {
  EquipRequirement,
  Game,
  Item,
  ItemSlot,
} from "../../../game/engine";
import { PLAYER_CLASSES } from "../../../game/data";
import { getItemRarityMeta } from "../../shared/components/itemRarity";

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

interface EffectToken {
  text: string;
  tone: "positive" | "negative";
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
      (id): id is string => id !== undefined,
    ),
  );

  let total = 0;
  for (const item of game.player.inventory) {
    if (!equippedIds.has(item.instanceId) || !item.armorValue) {
      continue;
    }
    total += item.armorValue;
  }

  return Math.max(0, total);
}

function formatSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatSignedFixed(value: number, digits: number): string {
  if (value > 0) return `+${value.toFixed(digits)}`;
  return value.toFixed(digits);
}

function getItemEffectTokens(item: Item): EffectToken[] {
  const parts: EffectToken[] = [];

  if (item.armorValue) {
    parts.push({
      text: `${formatSignedFixed(item.armorValue, 2)} armor`,
      tone: item.armorValue > 0 ? "positive" : "negative",
    });
  }

  const { effect } = item;
  if (effect.healthMax) {
    parts.push({
      text: `${formatSignedValue(effect.healthMax)} max HP`,
      tone: effect.healthMax > 0 ? "positive" : "negative",
    });
  }
  if (effect.health) {
    parts.push({
      text: `${formatSignedValue(effect.health)} HP`,
      tone: effect.health > 0 ? "positive" : "negative",
    });
  }
  if (effect.damageBase) {
    parts.push({
      text: `${formatSignedValue(effect.damageBase)} min dmg`,
      tone: effect.damageBase > 0 ? "positive" : "negative",
    });
  }
  if (effect.damageMax) {
    parts.push({
      text: `${formatSignedValue(effect.damageMax)} max dmg`,
      tone: effect.damageMax > 0 ? "positive" : "negative",
    });
  }
  if (effect.agility) {
    parts.push({
      text: `${formatSignedValue(effect.agility)} agility`,
      tone: effect.agility > 0 ? "positive" : "negative",
    });
  }
  if (effect.dexterity) {
    parts.push({
      text: `${formatSignedValue(effect.dexterity)} dexterity`,
      tone: effect.dexterity > 0 ? "positive" : "negative",
    });
  }

  return parts;
}

function EffectText({ item, className }: { item: Item; className: string }) {
  const tokens = getItemEffectTokens(item);
  if (tokens.length === 0) return null;

  return (
    <span className={className}>
      {tokens.map((token, index) => (
        <Fragment key={`${token.text}-${index}`}>
          {index > 0 && <span className="eq-effect-sep"> · </span>}
          <span className={`eq-effect-token eq-effect-token--${token.tone}`}>
            {token.text}
          </span>
        </Fragment>
      ))}
    </span>
  );
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
  const hoveredInventoryRarity = hoveredInventoryItem
    ? getItemRarityMeta(hoveredInventoryItem.rarity)
    : null;
  const hoveredEquippedRarity = hoveredItem
    ? getItemRarityMeta(hoveredItem.rarity)
    : null;

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
                  const rarity = getItemRarityMeta(item.rarity);
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
                  const isEquipped = Object.values(
                    game.player.equipment,
                  ).includes(item.instanceId);

                  const slotSummary =
                    equipSlots.length > 0
                      ? equipSlots
                          .map((slot) => REQUIREMENT_LABELS[slot])
                          .join(", ")
                      : "";

                  return (
                    <li
                      key={`${item.key}-${indices[0] ?? 0}`}
                      className={`eq-inv-item eq-inv-item--r${rarity.tier}`}
                      onMouseEnter={() =>
                        setInspectedInventoryId(item.instanceId)
                      }
                      onMouseLeave={() => setInspectedInventoryId(null)}
                    >
                      <span className="eq-inv-main">
                        <span className="eq-inv-icon">
                          {TYPE_ICON[item.type]}
                        </span>
                        <span className="eq-inv-text">
                          <strong className="eq-item-name">
                            <span className="eq-item-label">{item.label}</span>
                            {count > 1 && (
                              <span className="eq-inv-count"> x{count}</span>
                            )}
                          </strong>
                          <span className="eq-rarity-subtitle">
                            {rarity.label}
                          </span>
                          {slotSummary && (
                            <span className="eq-inv-slot-summary">
                              {slotSummary}
                            </span>
                          )}
                          <EffectText
                            item={item}
                            className="eq-inv-slot-summary"
                          />
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
                  <strong
                    className="eq-info-name eq-item-name"
                    style={
                      {
                        "--rarity-color": `var(--rarity-r${hoveredInventoryRarity?.tier ?? 1})`,
                      } as CSSProperties
                    }
                  >
                    <span className="eq-item-label">
                      {hoveredInventoryItem.label}
                    </span>
                  </strong>
                  <span
                    className="eq-rarity-subtitle"
                    style={
                      {
                        "--rarity-color": `var(--rarity-r${hoveredInventoryRarity?.tier ?? 1})`,
                      } as CSSProperties
                    }
                  >
                    {hoveredInventoryRarity?.label}
                  </span>
                  <p className="eq-info-desc">
                    {hoveredInventoryItem.description}
                  </p>
                  <EffectText
                    item={hoveredInventoryItem}
                    className="eq-info-effect"
                  />
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
                    <strong
                      className="eq-info-name eq-item-name"
                      style={
                        {
                          "--rarity-color": `var(--rarity-r${hoveredEquippedRarity?.tier ?? 1})`,
                        } as CSSProperties
                      }
                    >
                      <span className="eq-item-label">{hoveredItem.label}</span>
                    </strong>
                    <span
                      className="eq-rarity-subtitle"
                      style={
                        {
                          "--rarity-color": `var(--rarity-r${hoveredEquippedRarity?.tier ?? 1})`,
                        } as CSSProperties
                      }
                    >
                      {hoveredEquippedRarity?.label}
                    </span>
                    <p className="eq-info-desc">{hoveredItem.description}</p>
                    <EffectText item={hoveredItem} className="eq-info-effect" />
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

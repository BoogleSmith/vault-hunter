import type { CSSProperties } from "react";
import type { Item } from "../../../../game/engine";
import { getItemRarityMeta } from "../../../shared/components/itemRarity";
import { TYPE_ICON } from "./constants";
import { EffectText } from "./EffectText";
import "./ItemMeta.css";
import "./EquipmentInfoPanel.css";

interface EquipmentInfoPanelProps {
  hoveredInventoryItem?: Item;
  hoveredItem?: Item;
  hoveredSlotLabel?: string;
}

export function EquipmentInfoPanel({
  hoveredInventoryItem,
  hoveredItem,
  hoveredSlotLabel,
}: EquipmentInfoPanelProps) {
  const hoveredInventoryRarity = hoveredInventoryItem
    ? getItemRarityMeta(hoveredInventoryItem.rarity)
    : null;
  const hoveredEquippedRarity = hoveredItem
    ? getItemRarityMeta(hoveredItem.rarity)
    : null;

  return (
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
            <p className="eq-info-desc">{hoveredInventoryItem.description}</p>
            <EffectText
              item={hoveredInventoryItem}
              className="eq-info-effect"
            />
            <em className="eq-info-hint">Inventory item preview</em>
          </div>
        </div>
      ) : hoveredSlotLabel ? (
        hoveredItem ? (
          <div className="eq-info-filled">
            <span className="eq-info-icon">{TYPE_ICON[hoveredItem.type]}</span>
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
            <strong>{hoveredSlotLabel}</strong> - Empty slot
          </p>
        )
      ) : (
        <p className="eq-info-placeholder">Hover a slot to see item details</p>
      )}
    </div>
  );
}

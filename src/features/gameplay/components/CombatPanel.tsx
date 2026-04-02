import { PLAYER_CLASSES } from "../../../game/data";
import type { Enemy, Player } from "../../../game/types";
import "../../shared/components/controls.css";
import "./CombatPanel.css";
import { CombatEntityCard } from "./CombatEntityCard";
import { useCombatText } from "./useCombatText";
import {
  useCombatAnimationState,
  type CombatPresentationMode,
} from "./useCombatAnimationState";

interface CombatPanelProps {
  player: Player;
  enemy: Enemy;
  log: string[];
  onAttack: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
  isPlaying: boolean;
  presentationMode?: CombatPresentationMode;
}

export function CombatPanel({
  player,
  enemy,
  log,
  onAttack,
  onFlee,
  onOpenInventory,
  isPlaying,
  presentationMode = "active",
}: CombatPanelProps) {
  const classLabel = PLAYER_CLASSES[player.classKey].label;
  const {
    enemyMotionVariant,
    activeStep,
    displayedPlayerHealth,
    displayedEnemyHealth,
    enemyEntered,
    playerState,
    enemyState,
    isAnimating,
  } = useCombatAnimationState({
    player,
    enemy,
    log,
    presentationMode,
  });
  const { actionMeta, actionLabel, playerFloats, enemyFloats } = useCombatText({
    activeStep,
    presentationMode,
    enemyName: enemy.name,
  });
  const playerStats = [
    { label: "LVL", value: player.level },
    { label: "DMG", value: `${player.damageBase}–${player.damageMax}` },
    { label: "AGI", value: player.agility },
    { label: "DEX", value: player.dexterity },
  ];
  const enemyStats = [
    { label: "LVL", value: enemy.level },
    { label: "DMG", value: `${enemy.damageBase}–${enemy.damageMax}` },
    { label: "AGI", value: enemy.agility },
    { label: "ARM", value: enemy.armor.toFixed(2) },
  ];

  return (
    <div className={`combat-panel combat-panel--${presentationMode}`}>
      <p className="combat-panel__heading">Combat</p>

      <div
        className={`combat-callout ${isAnimating ? "is-active" : ""}`}
        aria-live="polite"
      >
        <span className="combat-callout__label">{actionMeta.label}</span>
        <span className="combat-callout__text">{actionLabel}</span>
      </div>

      <div
        className={`combat-arena ${actionMeta.arenaClassName} combat-arena--enemy-${enemyMotionVariant}`}
      >
        <CombatEntityCard
          side="player"
          state={playerState}
          name={player.name}
          classLabel={classLabel}
          portraitGlyph="🧙"
          healthCurrent={displayedPlayerHealth}
          healthMax={player.healthMax}
          stats={playerStats}
          floatTexts={playerFloats}
          combatShift={1}
        />

        <div className={`combat-vs ${isAnimating ? "is-active" : ""}`}>
          <span>{isAnimating ? actionMeta.badge : "VS"}</span>
        </div>

        <CombatEntityCard
          side="enemy"
          state={enemyState}
          name={enemy.name}
          portraitGlyph="👹"
          healthCurrent={displayedEnemyHealth}
          healthMax={enemy.healthMax}
          stats={enemyStats}
          floatTexts={enemyFloats}
          combatShift={-1}
          motionVariant={enemyMotionVariant}
          isEntering={!enemyEntered}
        />
      </div>

      <div className="combat-actions">
        <button onClick={onAttack} disabled={!isPlaying || isAnimating}>
          {isAnimating ? "Resolving..." : "⚔ Attack"}
        </button>
        <button
          className="ghost"
          onClick={onOpenInventory}
          disabled={!isPlaying || isAnimating}
        >
          💼 Inventory
        </button>
        <button
          className="ghost"
          onClick={onFlee}
          disabled={!isPlaying || isAnimating}
        >
          🏃 Flee
        </button>
      </div>
    </div>
  );
}

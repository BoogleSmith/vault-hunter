import { PLAYER_CLASSES } from "../../../../game/data";
import type { Enemy, Player } from "../../../../game/types";
import "../../../shared/components/controls.css";
import { CombatEntityCard } from "./CombatEntityCard";
import {
  CombatPresentationMode,
  useCombatAnimationState,
} from "./useCombatAnimationState";
import { useCombatText } from "./useCombatText";

import "./CombatPanel.css";

type PostCombatPhase = "none" | "animating" | "message" | "loot";

interface CombatPanelProps {
  player: Player;
  enemy: Enemy;
  log: string[];
  onAttack: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
  isPlaying: boolean;
  presentationMode?: CombatPresentationMode;
  postCombatPhase?: PostCombatPhase;
  postCombatEnemyName?: string | null;
  postCombatLootItems?: string[];
  postCombatHasSearched?: boolean;
  onSearchBody?: () => void;
  onReturnToRoom?: () => void;
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
  postCombatPhase = "none",
  postCombatLootItems = [],
  postCombatHasSearched = false,
  onSearchBody,
  onReturnToRoom,
}: CombatPanelProps) {
  const classLabel = PLAYER_CLASSES[player.classKey].label;
  const {
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

      <div className={`combat-arena ${actionMeta.arenaClassName}`}>
        <CombatEntityCard
          key={player.instanceId}
          direction="left"
          alignment="friendly"
          state={playerState}
          name={player.name}
          classLabel={classLabel}
          portraitGlyph="🧙"
          healthCurrent={displayedPlayerHealth}
          healthMax={player.healthMax}
          stats={playerStats}
          floatTexts={playerFloats}
        />

        <div className={`combat-vs ${isAnimating ? "is-active" : ""}`}>
          <span>{isAnimating ? actionMeta.badge : "VS"}</span>
        </div>

        <CombatEntityCard
          key={enemy.instanceId}
          direction="right"
          alignment="hostile"
          state={enemyEntered ? enemyState : "entering"}
          name={enemy.name}
          portraitGlyph="👹"
          healthCurrent={displayedEnemyHealth}
          healthMax={enemy.healthMax}
          stats={enemyStats}
          floatTexts={enemyFloats}
        />
      </div>

      <div className="combat-actions">
        {postCombatPhase === "message" || postCombatPhase === "loot" ? (
          <>
            {postCombatPhase === "loot" &&
              (postCombatLootItems.length > 0 ? (
                <ul className="combat-postcombat__loot">
                  {postCombatLootItems.map((item, i) => (
                    <li key={i} className="combat-postcombat__loot-item">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null)}
            <div className="combat-postcombat__buttons">
              <button onClick={onSearchBody} disabled={postCombatHasSearched}>
                🔍 Search
              </button>
              <button className="ghost" onClick={onOpenInventory}>
                💼 Inventory
              </button>
              <button className="ghost" onClick={onReturnToRoom}>
                🏃 Leave
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={onAttack} disabled={!isPlaying || isAnimating}>
              {isAnimating ? "Resolving..." : "⚔️ Attack"}
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
          </>
        )}
      </div>
    </div>
  );
}

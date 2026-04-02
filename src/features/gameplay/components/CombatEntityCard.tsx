import type { CSSProperties } from "react";
import { HealthBar } from "../../shared/components/HealthBar";

type CombatDirection = "left" | "right";
type CombatantState =
  | "idle"
  | "acting"
  | "hit"
  | "evade"
  | "defeat"
  | "flee"
  | "support"
  | "threaten"
  | "victory";
type FloatingTone = "damage" | "heal" | "miss" | "escape" | "item" | "defeat";

interface CombatEntityCardProps {
  direction: CombatDirection;
  state: CombatantState;
  name: string;
  classLabel?: string;
  portraitGlyph: string;
  healthCurrent: number;
  healthMax: number;
  stats: Array<{ label: string; value: string | number }>;
  floatTexts: Array<{ text: string; tone: FloatingTone }>;
  isEntering?: boolean;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="combat-stat-row">
      <span className="combat-stat-label">{label}</span>
      <span className="combat-stat-value">{value}</span>
    </div>
  );
}

export function CombatEntityCard({
  direction,
  state,
  name,
  classLabel,
  portraitGlyph,
  healthCurrent,
  healthMax,
  stats,
  floatTexts,
  isEntering = false,
}: CombatEntityCardProps) {
  const combatShift = direction === "left" ? 1 : -1;

  const classes = [
    "combatant-card",
    `combatant-card--${direction}`,
    isEntering ? "enemy-motion--entering" : "",
    `is-${state}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={{ "--combat-shift": combatShift } as CSSProperties}
    >
      <div className="combat-float-layer" aria-hidden="true">
        {floatTexts.map((item, index) => (
          <span
            key={`${item.tone}-${item.text}-${index}`}
            className={`combat-float combat-float--${item.tone}`}
          >
            {item.text}
          </span>
        ))}
      </div>
      <div className={`combatant-portrait combatant-portrait--${direction}`}>
        <span className="combatant-portrait__placeholder">{portraitGlyph}</span>
      </div>
      <div className="combatant-body">
        <div className="combatant-name-row">
          <span className="combatant-name">{name}</span>
          {classLabel ? (
            <span className="combatant-class">{classLabel}</span>
          ) : null}
        </div>
        <HealthBar current={healthCurrent} max={healthMax} />
        <div className="combat-stats">
          {stats.map((stat) => (
            <StatRow key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </div>
    </div>
  );
}

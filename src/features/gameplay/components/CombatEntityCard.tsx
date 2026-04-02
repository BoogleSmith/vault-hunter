import type { CSSProperties } from "react";
import { HealthBar } from "../../shared/components/HealthBar";

type CombatDirection = "left" | "right";
type CombatAlignment = "friendly" | "neutral" | "cautious" | "hostile";
type CombatantState =
  | "entering"
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
  alignment: CombatAlignment;
  state: CombatantState;
  name: string;
  classLabel?: string;
  portraitGlyph: string;
  healthCurrent: number;
  healthMax: number;
  stats: Array<{ label: string; value: string | number }>;
  floatTexts: Array<{ text: string; tone: FloatingTone }>;
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
  alignment,
  state,
  name,
  classLabel,
  portraitGlyph,
  healthCurrent,
  healthMax,
  stats,
  floatTexts,
}: CombatEntityCardProps) {
  const combatShift = direction === "left" ? 1 : -1;

  const classes = [
    "combatant-card",
    `combatant-card--${direction}`,
    `combatant-card--align-${alignment}`,
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
      <div className={`combatant-portrait combatant-portrait--${alignment}`}>
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

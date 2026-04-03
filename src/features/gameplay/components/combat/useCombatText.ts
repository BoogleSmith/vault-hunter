import { useMemo } from "react";

type CombatSide = "player" | "enemy";
type CombatStepKind = "attack" | "flee" | "item";
type CombatResult =
  | "hit"
  | "miss"
  | "defeat"
  | "escape"
  | "fail"
  | "use"
  | "channel";
type CombatPresentationMode = "active" | "victory-exit" | "escape-exit";
type FloatingTone = "damage" | "heal" | "miss" | "escape" | "item" | "defeat";

export interface CombatTextStep {
  kind: CombatStepKind;
  actor: CombatSide;
  attacker: CombatSide;
  target?: CombatSide;
  result: CombatResult;
  line: string;
}

interface FloatingText {
  text: string;
  side: CombatSide;
  tone: FloatingTone;
}

interface ActionMeta {
  label: string;
  badge: string;
  arenaClassName: string;
}

function parseHealAmount(line: string): number | null {
  const healMatch = line.match(/restoring (\d+) HP/);
  if (!healMatch?.[1]) {
    return null;
  }
  return Number(healMatch[1]);
}

function parseDamageAmount(line: string): number | null {
  const damageMatch = line.match(/for (\d+)/);
  if (!damageMatch?.[1]) {
    return null;
  }
  return Number(damageMatch[1]);
}

function getActionMeta(step: CombatTextStep | null): ActionMeta {
  if (!step) {
    return {
      label: "Action",
      badge: "VS",
      arenaClassName: "",
    };
  }

  if (step.kind === "item") {
    return {
      label: step.result === "channel" ? "Recovery" : "Item",
      badge: step.result === "channel" ? "RECOVER" : "ITEM",
      arenaClassName: "combat-arena--item",
    };
  }

  if (step.kind === "flee") {
    return {
      label: step.result === "escape" ? "Escape" : "Retreat",
      badge: step.result === "escape" ? "ESCAPE" : "RETREAT",
      arenaClassName: "combat-arena--flee",
    };
  }

  return {
    label: "Action",
    badge: "CLASH",
    arenaClassName: "combat-arena--attack",
  };
}

function getPresentationMeta(
  mode: CombatPresentationMode,
  enemyName: string,
): ActionMeta & { text: string } {
  if (mode === "victory-exit") {
    return {
      label: "Victory",
      badge: "FALLEN",
      arenaClassName: "combat-arena--victory-exit",
      text: `${enemyName} collapses and the fight breaks apart.`,
    };
  }

  if (mode === "escape-exit") {
    return {
      label: "Escape",
      badge: "EXIT",
      arenaClassName: "combat-arena--escape-exit",
      text: "You break away and leave the enemy behind.",
    };
  }

  return {
    label: "Action",
    badge: "VS",
    arenaClassName: "",
    text: "Choose your move.",
  };
}

function getFloatingTexts(step: CombatTextStep | null): FloatingText[] {
  if (!step) {
    return [];
  }

  if (step.kind === "attack") {
    if (step.result === "miss" && step.target) {
      return [{ text: "MISS", side: step.target, tone: "miss" }];
    }

    const damage = parseDamageAmount(step.line);
    const floats: FloatingText[] = [];

    if (damage && step.target) {
      floats.push({ text: `-${damage}`, side: step.target, tone: "damage" });
    }

    if (step.result === "defeat" && step.target) {
      floats.push({
        text: step.target === "enemy" ? "DEFEATED" : "DOWN",
        side: step.target,
        tone: "defeat",
      });
    }

    return floats;
  }

  if (step.kind === "item") {
    const healAmount = parseHealAmount(step.line);
    if (healAmount) {
      return [{ text: `+${healAmount}`, side: "player", tone: "heal" }];
    }

    const usedMatch = step.line.match(
      /^You used (.+?)(?:, restoring \d+ HP)?\.$/,
    );
    return [
      {
        text: usedMatch?.[1] ?? "ITEM",
        side: "player",
        tone: "item",
      },
    ];
  }

  return [
    {
      text: step.result === "escape" ? "ESCAPED" : "BLOCKED",
      side: "player",
      tone: "escape",
    },
  ];
}

export function useCombatText({
  activeStep,
  presentationMode,
  enemyName,
}: {
  activeStep: CombatTextStep | null;
  presentationMode: CombatPresentationMode;
  enemyName: string;
}) {
  return useMemo(() => {
    const presentationMeta = getPresentationMeta(presentationMode, enemyName);
    const actionMeta = activeStep
      ? getActionMeta(activeStep)
      : presentationMeta;
    const actionLabel = activeStep?.line ?? presentationMeta.text;
    const floatingTexts = getFloatingTexts(activeStep);
    const playerFloats = floatingTexts
      .filter((item) => item.side === "player")
      .map((item) => ({ text: item.text, tone: item.tone }));
    const enemyFloats = floatingTexts
      .filter((item) => item.side === "enemy")
      .map((item) => ({ text: item.text, tone: item.tone }));

    return {
      actionMeta,
      actionLabel,
      playerFloats,
      enemyFloats,
    };
  }, [activeStep, enemyName, presentationMode]);
}

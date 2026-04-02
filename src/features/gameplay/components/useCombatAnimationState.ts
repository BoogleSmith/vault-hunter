import { useEffect, useRef, useState } from "react";
import type { Enemy, Player } from "../../../game/types";

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
export type CombatPresentationMode = "active" | "victory-exit" | "escape-exit";
export type CombatantState =
  | "idle"
  | "acting"
  | "hit"
  | "evade"
  | "defeat"
  | "flee"
  | "support"
  | "threaten"
  | "victory";

export interface CombatAnimationStep {
  kind: CombatStepKind;
  actor: CombatSide;
  attacker: CombatSide;
  target?: CombatSide;
  result: CombatResult;
  line: string;
}

function parseCombatStep(
  line: string,
  playerName: string,
  enemyName: string,
): CombatAnimationStep | null {
  if (line.startsWith(`${playerName} hits ${enemyName} for `)) {
    return {
      kind: "attack",
      actor: "player",
      attacker: "player",
      target: "enemy",
      result: line.includes("is defeated.") ? "defeat" : "hit",
      line,
    };
  }

  if (line.startsWith(`${playerName} misses ${enemyName}.`)) {
    return {
      kind: "attack",
      actor: "player",
      attacker: "player",
      target: "enemy",
      result: "miss",
      line,
    };
  }

  if (line.startsWith(`${enemyName} hits ${playerName} for `)) {
    return {
      kind: "attack",
      actor: "enemy",
      attacker: "enemy",
      target: "player",
      result: line.includes("is defeated.") ? "defeat" : "hit",
      line,
    };
  }

  if (line.startsWith(`${enemyName} misses ${playerName}.`)) {
    return {
      kind: "attack",
      actor: "enemy",
      attacker: "enemy",
      target: "player",
      result: "miss",
      line,
    };
  }

  if (line === `${playerName} failed to escape!`) {
    return {
      kind: "flee",
      actor: "player",
      attacker: "player",
      result: "fail",
      line,
    };
  }

  if (line === `${playerName} escaped!`) {
    return {
      kind: "flee",
      actor: "player",
      attacker: "player",
      result: "escape",
      line,
    };
  }

  if (line.startsWith("You used ")) {
    return {
      kind: "item",
      actor: "player",
      attacker: "player",
      result: "use",
      line,
    };
  }

  if (line.startsWith("You channeled the ")) {
    return {
      kind: "item",
      actor: "player",
      attacker: "player",
      result: "channel",
      line,
    };
  }

  return null;
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

function getCombatantState(
  side: CombatSide,
  step: CombatAnimationStep | null,
): CombatantState {
  if (!step) {
    return "idle";
  }

  if (step.kind === "item") {
    if (step.actor === side) {
      return "support";
    }
    return "threaten";
  }

  if (step.kind === "flee") {
    if (step.actor === side) {
      return "flee";
    }
    return step.result === "fail" ? "threaten" : "idle";
  }

  if (step.attacker === side) {
    return "acting";
  }

  if (!step.target || step.target !== side) {
    return "idle";
  }

  if (step.result === "miss") {
    return "evade";
  }

  if (step.result === "defeat") {
    return "defeat";
  }

  return "hit";
}

export function useCombatAnimationState({
  player,
  enemy,
  log,
  presentationMode,
}: {
  player: Player;
  enemy: Enemy;
  log: string[];
  presentationMode: CombatPresentationMode;
}) {
  const [stepQueue, setStepQueue] = useState<CombatAnimationStep[]>([]);
  const [activeStep, setActiveStep] = useState<CombatAnimationStep | null>(
    null,
  );
  const [displayedPlayerHealth, setDisplayedPlayerHealth] = useState(
    player.health,
  );
  const [displayedEnemyHealth, setDisplayedEnemyHealth] = useState(
    enemy.health,
  );
  const [enemyEntered, setEnemyEntered] = useState(false);
  const previousStateRef = useRef({
    logLength: log.length,
  });

  useEffect(() => {
    const resetId = window.setTimeout(() => setEnemyEntered(false), 0);
    const doneId = window.setTimeout(() => {
      setEnemyEntered(true);
    }, 870);
    return () => {
      window.clearTimeout(resetId);
      window.clearTimeout(doneId);
    };
  }, [enemy.name]);

  useEffect(() => {
    const previous = previousStateRef.current;

    if (log.length < previous.logLength) {
      const resetTimeoutId = window.setTimeout(() => {
        setStepQueue([]);
        setActiveStep(null);
        setDisplayedPlayerHealth(player.health);
        setDisplayedEnemyHealth(enemy.health);
      }, 0);
      previousStateRef.current = {
        logLength: log.length,
      };
      return () => window.clearTimeout(resetTimeoutId);
    }

    const appendedLines = log.slice(previous.logLength);
    const nextSteps = appendedLines
      .map((line) => parseCombatStep(line, player.name, enemy.name))
      .filter((step): step is CombatAnimationStep => step !== null);

    if (nextSteps.length > 0) {
      setStepQueue((current) => [...current, ...nextSteps]);
    }

    previousStateRef.current = {
      logLength: log.length,
    };
  }, [enemy.health, enemy.name, log, player.health, player.name]);

  useEffect(() => {
    if (activeStep || stepQueue.length === 0) {
      return;
    }

    const nextStep = stepQueue[0];
    if (!nextStep) {
      return;
    }

    const startTimeoutId = window.setTimeout(() => {
      setActiveStep(nextStep);
    }, 0);

    return () => window.clearTimeout(startTimeoutId);
  }, [activeStep, stepQueue]);

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    const duration =
      activeStep.result === "defeat"
        ? 1120
        : activeStep.kind === "item"
          ? 840
          : 760;
    const finishTimeoutId = window.setTimeout(() => {
      setActiveStep(null);
      setStepQueue((current) => current.slice(1));
    }, duration);

    return () => window.clearTimeout(finishTimeoutId);
  }, [activeStep]);

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    const timeouts: number[] = [];

    if (activeStep.kind === "attack" && activeStep.result !== "miss") {
      const damage = parseDamageAmount(activeStep.line);
      if (damage && activeStep.target === "enemy") {
        timeouts.push(
          window.setTimeout(() => {
            setDisplayedEnemyHealth((current) => Math.max(0, current - damage));
          }, 180),
        );
      }
      if (damage && activeStep.target === "player") {
        timeouts.push(
          window.setTimeout(() => {
            setDisplayedPlayerHealth((current) =>
              Math.max(0, current - damage),
            );
          }, 180),
        );
      }
    }

    if (activeStep.kind === "item") {
      const healAmount = parseHealAmount(activeStep.line);
      if (healAmount) {
        timeouts.push(
          window.setTimeout(() => {
            setDisplayedPlayerHealth((current) =>
              Math.min(player.healthMax, current + healAmount),
            );
          }, 180),
        );
      }
    }

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [activeStep, player.healthMax]);

  const playerState: CombatantState = activeStep
    ? getCombatantState("player", activeStep)
    : presentationMode === "escape-exit"
      ? "flee"
      : presentationMode === "victory-exit"
        ? "victory"
        : "idle";
  const enemyState: CombatantState = activeStep
    ? getCombatantState("enemy", activeStep)
    : presentationMode === "victory-exit"
      ? "defeat"
      : presentationMode === "escape-exit"
        ? "threaten"
        : "idle";

  const isAnimating =
    activeStep !== null ||
    stepQueue.length > 0 ||
    presentationMode !== "active";

  return {
    activeStep,
    displayedPlayerHealth,
    displayedEnemyHealth,
    enemyEntered,
    playerState,
    enemyState,
    isAnimating,
  };
}

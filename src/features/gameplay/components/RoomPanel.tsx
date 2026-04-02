import { useEffect, useRef, useState } from "react";
import "../../shared/components/controls.css";
import "../../shared/components/surface.css";
import "./RoomPanel.css";
import { CombatPanel } from "./CombatPanel";
import { getRoomMeta, type Game, type Room } from "../../../game/engine";

type PostCombatPhase = "none" | "animating" | "message" | "loot";

interface VictoryState {
  enemyName: string;
  lootItems: string[];
}

interface RoomPanelProps {
  game: Game;
  currentRoom: Room;
  inEncounter: boolean;
  onCombatVisibilityChange?: (visible: boolean) => void;
  onAttack: () => void;
  onFlee: () => void;
  onOpenInventory: () => void;
}

export function RoomPanel({
  game,
  currentRoom,
  inEncounter,
  onCombatVisibilityChange,
  onAttack,
  onFlee,
  onOpenInventory,
}: RoomPanelProps) {
  const roomMeta = getRoomMeta(currentRoom);
  const isPlaying = game.status === "playing";
  const [combatPresentation, setCombatPresentation] = useState<
    "active" | "victory-exit"
  >("active");
  const [encounterNotice, setEncounterNotice] = useState<{
    tone: "alert" | "escape";
    text: string;
  } | null>(null);
  const [postCombatPhase, setPostCombatPhase] =
    useState<PostCombatPhase>("none");
  const [victoryState, setVictoryState] = useState<VictoryState | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);
  const victoryTimeoutRef = useRef<number | null>(null);
  const previousStateRef = useRef<{
    roomX: number;
    roomY: number;
    inEncounter: boolean;
    enemyName: string | null;
  }>({
    roomX: currentRoom.x,
    roomY: currentRoom.y,
    inEncounter,
    enemyName: currentRoom.enemy.alive ? currentRoom.enemy.name : null,
  });

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
      if (victoryTimeoutRef.current !== null) {
        window.clearTimeout(victoryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previous = previousStateRef.current;
    const stayedInSameRoom =
      previous.roomX === currentRoom.x && previous.roomY === currentRoom.y;
    const recentLog = game.log.slice(-4);
    const escaped = recentLog.includes(`${game.player.name} escaped!`);

    function showNotice(tone: "alert" | "escape", text: string): void {
      window.setTimeout(() => {
        setEncounterNotice({ tone, text });
      }, 0);
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
      noticeTimeoutRef.current = window.setTimeout(() => {
        setEncounterNotice(null);
        noticeTimeoutRef.current = null;
      }, 1800);
    }

    function beginVictorySequence(enemyName: string): void {
      if (victoryTimeoutRef.current !== null) {
        window.clearTimeout(victoryTimeoutRef.current);
      }
      const lootItems = game.log.slice(-10).flatMap((line) => {
        const m = line.match(/^You found (.+) on the body!$/);
        return m?.[1] ? [m[1]] : [];
      });
      window.setTimeout(() => {
        setCombatPresentation("victory-exit");
        setPostCombatPhase("animating");
        setVictoryState({ enemyName, lootItems });
      }, 0);
      victoryTimeoutRef.current = window.setTimeout(() => {
        setPostCombatPhase("message");
        victoryTimeoutRef.current = null;
      }, 1450);
    }

    if (!previous.inEncounter && inEncounter && currentRoom.enemy.alive) {
      if (victoryTimeoutRef.current !== null) {
        window.clearTimeout(victoryTimeoutRef.current);
        victoryTimeoutRef.current = null;
      }
      window.setTimeout(() => {
        setCombatPresentation("active");
        setPostCombatPhase("none");
        setVictoryState(null);
      }, 0);
      showNotice(
        "alert",
        stayedInSameRoom
          ? `${currentRoom.enemy.name} roams into the room.`
          : `${currentRoom.enemy.name} enters the fight.`,
      );
    }

    if (previous.inEncounter && !inEncounter) {
      if (escaped) {
        showNotice("escape", "You slip out of the fight.");
      } else if (!currentRoom.enemy.alive && stayedInSameRoom) {
        beginVictorySequence(previous.enemyName ?? "Enemy");
      }
    }

    previousStateRef.current = {
      roomX: currentRoom.x,
      roomY: currentRoom.y,
      inEncounter,
      enemyName: currentRoom.enemy.alive ? currentRoom.enemy.name : null,
    };
  }, [currentRoom, game.log, game.player.name, inEncounter]);

  function advanceFromMessage(): void {
    if (victoryState && victoryState.lootItems.length > 0) {
      setPostCombatPhase("loot");
    } else {
      setPostCombatPhase("none");
      setVictoryState(null);
    }
  }

  function advanceFromLoot(): void {
    setPostCombatPhase("none");
    setVictoryState(null);
  }

  const showCombatPanel = inEncounter || postCombatPhase !== "none";

  useEffect(() => {
    onCombatVisibilityChange?.(showCombatPanel);
  }, [onCombatVisibilityChange, showCombatPanel]);

  return (
    <section className="panel room">
      <h2>{roomMeta.key}</h2>
      <p>{roomMeta.description}</p>

      {encounterNotice && (
        <div
          className={`room-combat-toast room-combat-toast--${encounterNotice.tone}`}
        >
          <span className="room-combat-toast__eyebrow">
            {encounterNotice.tone === "escape" ? "Escape" : "Encounter"}
          </span>
          <span className="room-combat-toast__text">
            {encounterNotice.text}
          </span>
        </div>
      )}

      {postCombatPhase === "message" && victoryState && (
        <div className="room-postcombat-card">
          <span className="room-postcombat-card__eyebrow">Victory</span>
          <p className="room-postcombat-card__message">
            <strong>{victoryState.enemyName}</strong> has been defeated.
          </p>
          <button
            className="room-postcombat-card__button"
            onClick={advanceFromMessage}
          >
            {victoryState.lootItems.length > 0
              ? "Check the Body →"
              : "Return to Room"}
          </button>
        </div>
      )}

      {postCombatPhase === "loot" && victoryState && (
        <div className="room-postcombat-card room-postcombat-card--loot">
          <span className="room-postcombat-card__eyebrow">Items Found</span>
          <ul className="room-postcombat-card__loot-list">
            {victoryState.lootItems.map((item, i) => (
              <li key={i} className="room-postcombat-card__loot-item">
                {item}
              </li>
            ))}
          </ul>
          <button
            className="room-postcombat-card__button"
            onClick={advanceFromLoot}
          >
            Return to Room
          </button>
        </div>
      )}

      <div style={showCombatPanel ? undefined : { display: "none" }}>
        <CombatPanel
          key={`${currentRoom.x}-${currentRoom.y}-${currentRoom.enemy.instanceId}`}
          player={game.player}
          enemy={currentRoom.enemy}
          log={game.log}
          onAttack={onAttack}
          onFlee={onFlee}
          onOpenInventory={onOpenInventory}
          isPlaying={isPlaying && inEncounter}
          presentationMode={inEncounter ? "active" : combatPresentation}
        />
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

import {
  type ArmorKey,
  type DifficultyKey,
  type DirectionKey,
  type PlayerClassKey,
} from "./game/data";
import {
  advanceEnemyRoaming,
  getAvailableDirections,
  getCurrentRoom,
  movePlayer,
  createGame,
} from "./game/map";
import { createPlayer } from "./game/player";
import { runCombatRound, runEnemyTurn, tryFlee } from "./game/combat";
import { equipItem, unequipSlot, useItem } from "./game/mechanics";
import type { Game, ItemSlot } from "./game/types";
import { GameplayPage } from "./features/gameplay/GameplayPage";
import { GameOverPage } from "./features/gameover/GameOverPage";
import { InterruptPrompt } from "./features/gameplay/components/InterruptPrompt";
import { SetupPage } from "./features/setup/SetupPage";

const EMPTY_DIRECTIONS: Record<DirectionKey, boolean> = {
  RIGHT: false,
  DOWN: false,
  LEFT: false,
  UP: false,
};

function App() {
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>("MEDIUM");
  const [classKey, setClassKey] = useState<PlayerClassKey>("WARRIOR");
  const [armorKey, setArmorKey] = useState<ArmorKey>("MEDIUM");
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [showEnemyDebug, setShowEnemyDebug] = useState(false);
  const [pendingPrompts, setPendingPrompts] = useState<
    Array<{ title: string; message: string }>
  >([]);
  const previousGameRef = useRef<Game | null>(null);

  const currentRoom = useMemo(
    () => (game ? getCurrentRoom(game) : null),
    [game],
  );
  const availableDirections = useMemo(
    () => (game ? getAvailableDirections(game) : EMPTY_DIRECTIONS),
    [game],
  );

  const inEncounter = Boolean(game && currentRoom?.enemy.alive);
  const activePrompt = pendingPrompts[0];

  useEffect(() => {
    if (!game || game.status !== "playing") {
      previousGameRef.current = game;
      return;
    }

    const previous = previousGameRef.current;
    if (!previous || previous.status !== "playing") {
      previousGameRef.current = game;
      return;
    }

    const nextPrompts: Array<{ title: string; message: string }> = [];

    const previousRoom = getCurrentRoom(previous);
    const nextRoom = getCurrentRoom(game);
    const previousEnemy = previousRoom?.enemy;
    const nextEnemy = nextRoom?.enemy;
    const wasEncounter = Boolean(previousEnemy?.alive);
    const nowEncounter = Boolean(nextEnemy?.alive);

    const enemyChangedWhileEncountered =
      wasEncounter &&
      nowEncounter &&
      !!previousEnemy &&
      !!nextEnemy &&
      (nextEnemy.name !== previousEnemy.name ||
        nextEnemy.phrase !== previousEnemy.phrase ||
        nextEnemy.health > previousEnemy.health ||
        nextEnemy.healthMax !== previousEnemy.healthMax);

    if ((!wasEncounter && nowEncounter) || enemyChangedWhileEncountered) {
      nextPrompts.push({
        title: "Enemy Encountered!",
        message: `${nextEnemy?.name ?? "An enemy"} steps into your path.`,
      });
    }

    const previousIds = new Set(
      previous.player.inventory
        .map((item) => item.instanceId)
        .filter((id): id is number => id !== undefined),
    );
    for (const item of game.player.inventory) {
      if (item.instanceId !== undefined && !previousIds.has(item.instanceId)) {
        nextPrompts.push({
          title: "You acquired an item!",
          message: `You obtained ${item.label}. ${item.description}`,
        });
      }
    }

    if (nextPrompts.length > 0) {
      setPendingPrompts((current) => [...current, ...nextPrompts]);
    }

    previousGameRef.current = game;
  }, [game]);

  function startGame(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const player = createPlayer({ name: playerName, classKey, armorKey });
    setGame(createGame({ difficultyKey, player }));
  }

  function withGameUpdate(mutator: (next: Game) => void): void {
    setGame((previous) => {
      if (!previous || previous.status !== "playing") {
        return previous;
      }
      const next = structuredClone(previous);
      mutator(next);
      return next;
    });
  }

  function handleMove(directionKey: DirectionKey): void {
    if (activePrompt) return;
    withGameUpdate((next) => {
      movePlayer(next, directionKey);
      advanceEnemyRoaming(next);
    });
  }

  function handleAttack(): void {
    if (activePrompt) return;
    withGameUpdate((next) => {
      runCombatRound(next);
      advanceEnemyRoaming(next);
    });
  }

  function handleFlee(): void {
    if (activePrompt) return;
    withGameUpdate((next) => {
      tryFlee(next);
      advanceEnemyRoaming(next);
    });
  }

  function handleUseItem(index: number): void {
    if (activePrompt) return;
    withGameUpdate((next) => {
      const used = useItem(next, index);
      if (used) {
        runEnemyTurn(next);
        advanceEnemyRoaming(next);
      }
    });
  }

  function handleEquipItem(index: number): void {
    if (activePrompt) return;
    withGameUpdate((next) => {
      equipItem(next, index);
    });
  }

  function handleUnequipSlot(slot: ItemSlot): void {
    if (activePrompt) return;
    withGameUpdate((next) => {
      unequipSlot(next, slot);
    });
  }

  function handleDismissPrompt(): void {
    setPendingPrompts((current) => current.slice(1));
  }

  function resetGame(): void {
    setPendingPrompts([]);
    previousGameRef.current = null;
    setGame(null);
  }

  if (game && game.status !== "playing") {
    return <GameOverPage game={game} onPlayAgain={resetGame} />;
  }

  if (!game) {
    return (
      <SetupPage
        playerName={playerName}
        difficultyKey={difficultyKey}
        classKey={classKey}
        armorKey={armorKey}
        onPlayerNameChange={setPlayerName}
        onDifficultyChange={setDifficultyKey}
        onClassChange={setClassKey}
        onArmorChange={setArmorKey}
        onSubmit={startGame}
      />
    );
  }

  if (!currentRoom) {
    return null;
  }

  return (
    <>
      <GameplayPage
        game={game}
        currentRoom={currentRoom}
        availableDirections={availableDirections}
        inEncounter={inEncounter}
        onMove={handleMove}
        onAttack={handleAttack}
        onFlee={handleFlee}
        onReset={resetGame}
        onUseItem={handleUseItem}
        onEquipItem={handleEquipItem}
        onUnequipSlot={handleUnequipSlot}
        showEnemyDebug={showEnemyDebug}
        onToggleEnemyDebug={() => setShowEnemyDebug((current) => !current)}
      />
      {activePrompt && (
        <InterruptPrompt
          title={activePrompt.title}
          message={activePrompt.message}
          onDismiss={handleDismissPrompt}
        />
      )}
    </>
  );
}

export default App;

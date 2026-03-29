import { useMemo, useState } from "react";
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

  const currentRoom = useMemo(
    () => (game ? getCurrentRoom(game) : null),
    [game],
  );
  const availableDirections = useMemo(
    () => (game ? getAvailableDirections(game) : EMPTY_DIRECTIONS),
    [game],
  );

  const inEncounter = Boolean(game && currentRoom?.enemy.alive);

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
    withGameUpdate((next) => {
      movePlayer(next, directionKey);
      advanceEnemyRoaming(next);
    });
  }

  function handleAttack(): void {
    withGameUpdate((next) => {
      runCombatRound(next);
      advanceEnemyRoaming(next);
    });
  }

  function handleFlee(): void {
    withGameUpdate((next) => {
      tryFlee(next);
      advanceEnemyRoaming(next);
    });
  }

  function handleUseItem(index: number): void {
    withGameUpdate((next) => {
      const used = useItem(next, index);
      if (used) {
        runEnemyTurn(next);
        advanceEnemyRoaming(next);
      }
    });
  }

  function handleEquipItem(index: number): void {
    withGameUpdate((next) => {
      equipItem(next, index);
    });
  }

  function handleUnequipSlot(slot: ItemSlot): void {
    withGameUpdate((next) => {
      unequipSlot(next, slot);
    });
  }

  function resetGame(): void {
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
  );
}

export default App;

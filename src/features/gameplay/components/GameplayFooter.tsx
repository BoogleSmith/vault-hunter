import { DebugMenu } from "./DebugMenu";
import type { Game } from "../../../game/engine";
import "./GameplayFooter.css";

interface GameplayFooterProps {
  game: Game;
  showEnemyDebug: boolean;
  onReset: () => void;
  onToggleEnemyDebug: () => void;
  onForceVictory: () => void;
  onForceDeath: () => void;
}

export function GameplayFooter({
  game,
  showEnemyDebug,
  onReset,
  onToggleEnemyDebug,
  onForceVictory,
  onForceDeath,
}: GameplayFooterProps) {
  return (
    <footer className="gameplay-footer">
      <button className="exit-fab" onClick={onReset}>
        ← Exit
      </button>
      <DebugMenu
        canForceOutcome={game.status === "playing"}
        showEnemyDebug={showEnemyDebug}
        onToggleEnemyDebug={onToggleEnemyDebug}
        onForceVictory={onForceVictory}
        onForceDeath={onForceDeath}
      />
    </footer>
  );
}

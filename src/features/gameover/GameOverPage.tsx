import type { Game } from "../../game/engine";
import "../shared/components/controls.css";
import "../shared/components/shell.css";
import "../shared/components/surface.css";
import "./GameOverPage.css";
import { FinalStats } from "./components/FinalStats";

interface GameOverPageProps {
  game: Game;
  onPlayAgain: () => void;
}

export function GameOverPage({ game, onPlayAgain }: GameOverPageProps) {
  const isWin = game.status === "won";

  return (
    <main className="shell game-over-shell">
      {isWin && (
        <div className="victory-scene" aria-hidden="true">
          <div className="victory-scene__glow" />
          <div className="victory-scene__coins" />
          <div className="victory-scene__chest">
            <div className="victory-scene__lid" />
            <div className="victory-scene__box" />
          </div>
          <div className="victory-scene__ground" />
        </div>
      )}
      {!isWin && (
        <div className="death-scene" aria-hidden="true">
          <div className="death-scene__spotlight" />
          <div className="death-scene__grave" />
          <div className="death-scene__ground" />
        </div>
      )}
      <section className="panel game-over">
        <h1>{isWin ? "Victory!" : "Game Over"}</h1>
        <p className="game-over-message">
          {isWin
            ? `Congratulations, ${game.player.name}! You've conquered the vault!`
            : `Brave ${game.player.name}, you have fallen in the depths...`}
        </p>

        <FinalStats game={game} />

        <button className="primary" onClick={onPlayAgain}>
          Play Again
        </button>
      </section>
    </main>
  );
}

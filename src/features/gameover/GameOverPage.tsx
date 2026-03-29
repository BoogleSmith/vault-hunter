import type { Game } from "../../game/engine";
import { FinalStats } from "./components/FinalStats";

interface GameOverPageProps {
  game: Game;
  onPlayAgain: () => void;
}

export function GameOverPage({ game, onPlayAgain }: GameOverPageProps) {
  const isWin = game.status === "won";

  return (
    <main className="shell">
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

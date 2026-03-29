import type { FormEvent } from "react";

import type { DifficultyKey, PlayerClassKey } from "../../game/data";
import { SetupForm } from "./components/SetupForm";

interface SetupPageProps {
  playerName: string;
  difficultyKey: DifficultyKey;
  classKey: PlayerClassKey;
  onPlayerNameChange: (value: string) => void;
  onDifficultyChange: (value: DifficultyKey) => void;
  onClassChange: (value: PlayerClassKey) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SetupPage(props: SetupPageProps) {
  return (
    <main className="shell">
      <section className="panel intro">
        <h1>Vault Hunter</h1>
        <p>
          Welcome to <strong>Vault Hunter</strong>, a randomly generated
          adventure game!
        </p>
      </section>

      <section className="panel setup">
        <SetupForm {...props} />
      </section>
    </main>
  );
}

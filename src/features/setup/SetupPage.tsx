import type { FormEvent } from "react";

import type { ArmorKey, DifficultyKey, PlayerClassKey } from "../../game/data";
import { SetupForm } from "./components/SetupForm";

interface SetupPageProps {
  playerName: string;
  difficultyKey: DifficultyKey;
  classKey: PlayerClassKey;
  armorKey: ArmorKey;
  onPlayerNameChange: (value: string) => void;
  onDifficultyChange: (value: DifficultyKey) => void;
  onClassChange: (value: PlayerClassKey) => void;
  onArmorChange: (value: ArmorKey) => void;
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

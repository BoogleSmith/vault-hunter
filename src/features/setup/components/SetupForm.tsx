import type { FormEvent } from "react";

import {
  ARMOR,
  DIFFICULTIES,
  type ArmorKey,
  type DifficultyKey,
  PLAYER_CLASSES,
  type PlayerClassKey,
} from "../../../game/data";

interface SetupFormProps {
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

export function SetupForm({
  playerName,
  difficultyKey,
  classKey,
  armorKey,
  onPlayerNameChange,
  onDifficultyChange,
  onClassChange,
  onArmorChange,
  onSubmit,
}: SetupFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="name">Adventurer Name</label>
      <input
        id="name"
        value={playerName}
        onChange={(event) => onPlayerNameChange(event.target.value)}
        placeholder="Stranger"
      />

      <label htmlFor="difficulty">Difficulty</label>
      <select
        id="difficulty"
        value={difficultyKey}
        onChange={(event) =>
          onDifficultyChange(event.target.value as DifficultyKey)
        }
      >
        {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
          <option key={key} value={key}>
            {DIFFICULTIES[key].label} ({DIFFICULTIES[key].width}x
            {DIFFICULTIES[key].height})
          </option>
        ))}
      </select>

      <label htmlFor="class">Class</label>
      <select
        id="class"
        value={classKey}
        onChange={(event) =>
          onClassChange(event.target.value as PlayerClassKey)
        }
      >
        {(Object.keys(PLAYER_CLASSES) as PlayerClassKey[]).map((key) => (
          <option key={key} value={key}>
            {PLAYER_CLASSES[key].label}
          </option>
        ))}
      </select>

      <label htmlFor="armor">Armor</label>
      <select
        id="armor"
        value={armorKey}
        onChange={(event) => onArmorChange(event.target.value as ArmorKey)}
      >
        {(Object.keys(ARMOR) as ArmorKey[]).map((key) => (
          <option key={key} value={key}>
            {ARMOR[key].label}
          </option>
        ))}
      </select>

      <button type="submit">Enter the Castle</button>
    </form>
  );
}

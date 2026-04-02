import type { FormEvent } from "react";
import "../../shared/components/controls.css";

import {
  DIFFICULTIES,
  type DifficultyKey,
  ITEMS,
  PLAYER_CLASSES,
  type PlayerClassKey,
} from "../../../game/data";
import { getStartingStatsForClass } from "../../../game/player";

interface SetupFormProps {
  playerName: string;
  difficultyKey: DifficultyKey;
  classKey: PlayerClassKey;
  onPlayerNameChange: (value: string) => void;
  onDifficultyChange: (value: DifficultyKey) => void;
  onClassChange: (value: PlayerClassKey) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const CLASS_STAT_LABELS = {
  health: "Health",
  healthMax: "Max Health",
  damageBase: "Damage Base",
  damageMax: "Damage Max",
  agility: "Agility",
  dexterity: "Dexterity",
} as const;

export function SetupForm({
  playerName,
  difficultyKey,
  classKey,
  onPlayerNameChange,
  onDifficultyChange,
  onClassChange,
  onSubmit,
}: SetupFormProps) {
  const selectedClass = PLAYER_CLASSES[classKey];
  const classStats = Object.entries(getStartingStatsForClass(classKey));
  const classItems = Object.entries(
    selectedClass.startingItems.reduce<Record<string, number>>(
      (counts, itemKey) => {
        counts[itemKey] = (counts[itemKey] ?? 0) + 1;
        return counts;
      },
      {},
    ),
  ).map(([itemKey, count]) => ({
    item: ITEMS[itemKey as keyof typeof ITEMS],
    count,
  }));

  return (
    <form className="setup-form" onSubmit={onSubmit}>
      <div className="setup-form-fields">
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

        <button type="submit">Enter the Castle</button>
      </div>

      <aside className="setup-preview" aria-live="polite">
        <h2>{selectedClass.label}</h2>
        <p className="setup-preview-summary">{selectedClass.summary}</p>

        <div className="setup-preview-section">
          <h3>Starting Stats</h3>
          <ul>
            {classStats
              .filter(([statKey]) => statKey !== "alive")
              .map(([statKey, value]) => (
                <li key={statKey}>
                  <strong>
                    {
                      CLASS_STAT_LABELS[
                        statKey as keyof typeof CLASS_STAT_LABELS
                      ]
                    }
                  </strong>
                  <span>{value}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="setup-preview-section">
          <h3>Starting Items</h3>
          <ul>
            {classItems.map(({ item, count }) => (
              <li key={item.key}>
                <strong>
                  {item.label}
                  {count > 1 ? ` x${count}` : ""}
                </strong>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </form>
  );
}

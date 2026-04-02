import type { Meta, StoryObj } from "@storybook/react-vite";
import { CombatEntityCard } from "./CombatEntityCard";
import "./CombatPanel.css";

const meta = {
  title: "Gameplay/Combat Entity Card",
  component: CombatEntityCard,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "360px", padding: "1rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    side: "player",
    state: "idle",
    name: "Arin",
    classLabel: "Warrior",
    portraitGlyph: "🧙",
    healthCurrent: 86,
    healthMax: 120,
    stats: [
      { label: "LVL", value: 4 },
      { label: "DMG", value: "18-28" },
      { label: "AGI", value: 14 },
      { label: "DEX", value: 22 },
    ],
    floatTexts: [],
    combatShift: 1,
  },
  argTypes: {
    side: { control: "inline-radio", options: ["player", "enemy"] },
    state: {
      control: "select",
      options: [
        "idle",
        "acting",
        "hit",
        "evade",
        "defeat",
        "flee",
        "support",
        "threaten",
        "victory",
      ],
    },
    motionVariant: {
      control: "select",
      options: [
        undefined,
        "menace",
        "skirmisher",
        "beast",
        "spectral",
        "brute",
        "guardian",
        "dragon",
      ],
    },
    isEntering: { control: "boolean" },
    combatShift: { control: "inline-radio", options: [1, -1] },
  },
} satisfies Meta<typeof CombatEntityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayerIdle: Story = {};

export const EnemyThreaten: Story = {
  args: {
    side: "enemy",
    state: "threaten",
    name: "Spectral Guard",
    classLabel: undefined,
    portraitGlyph: "👹",
    healthCurrent: 140,
    healthMax: 180,
    stats: [
      { label: "LVL", value: 5 },
      { label: "DMG", value: "16-24" },
      { label: "AGI", value: 26 },
      { label: "ARM", value: "0.70" },
    ],
    combatShift: -1,
    motionVariant: "guardian",
    isEntering: true,
    floatTexts: [{ text: "INTIMIDATE", tone: "item" }],
  },
};

export const PlayerHit: Story = {
  args: {
    state: "hit",
    healthCurrent: 34,
    floatTexts: [{ text: "-28", tone: "damage" }],
  },
};

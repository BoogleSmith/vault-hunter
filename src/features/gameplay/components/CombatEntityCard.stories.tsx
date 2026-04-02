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
    direction: "left",
    alignment: "friendly",
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
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["left", "right"] },
    alignment: {
      control: "inline-radio",
      options: ["friendly", "neutral", "cautious", "hostile"],
    },
    state: {
      control: "select",
      options: [
        "entering",
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
  },
} satisfies Meta<typeof CombatEntityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayerIdle: Story = {};

export const EnemyThreaten: Story = {
  args: {
    direction: "right",
    alignment: "hostile",
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

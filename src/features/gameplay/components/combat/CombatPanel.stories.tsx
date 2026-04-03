import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Enemy, Player } from "../../../../game/types";
import { CombatPanel } from "./CombatPanel";

function makePlayer(): Player {
  return {
    instanceId: "player-story-1",
    template: { classKey: "WARRIOR" },
    name: "Arin",
    classKey: "WARRIOR",
    level: 4,
    experience: 95,
    health: 92,
    healthMax: 120,
    damageBase: 18,
    damageMax: 28,
    agility: 14,
    dexterity: 22,
    alive: true,
    inventory: [],
    equipment: {},
    itemCooldowns: {},
    usedItemKeys: [],
  };
}

function makeEnemy(): Enemy {
  return {
    instanceId: "enemy-story-1",
    template: {
      name: "Spectral Guard",
      level: 5,
      experienceReward: 42,
      armor: 0.7,
      phrase: "You should not be here.",
      description: "A pale guardian steps from the shadows.",
      lootTags: ["spectral", "guardian"],
      roamRate: 1,
      undiscoveredRoaming: false,
      health: 160,
      healthMax: 160,
      damageBase: 16,
      damageMax: 24,
      agility: 26,
      dexterity: 18,
      alive: true,
    },
    name: "Spectral Guard",
    level: 5,
    experienceReward: 42,
    armor: 0.7,
    phrase: "You should not be here.",
    description: "A pale guardian steps from the shadows.",
    lootTags: ["spectral", "guardian"],
    roamRate: 1,
    undiscoveredRoaming: false,
    health: 160,
    healthMax: 160,
    damageBase: 16,
    damageMax: 24,
    agility: 26,
    dexterity: 18,
    alive: true,
    roamDelayRemaining: undefined,
    inventory: [],
  };
}

const meta = {
  title: "Gameplay/Combat Panel",
  component: CombatPanel,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "1rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    player: makePlayer(),
    enemy: makeEnemy(),
    log: [
      "Arin hits Spectral Guard for 17.",
      "Spectral Guard hits Arin for 11.",
    ],
    isPlaying: true,
    presentationMode: "active",
    onAttack: () => {},
    onFlee: () => {},
    onOpenInventory: () => {},
  },
  argTypes: {
    presentationMode: {
      control: "inline-radio",
      options: ["active", "victory-exit", "escape-exit"],
    },
    isPlaying: { control: "boolean" },
  },
} satisfies Meta<typeof CombatPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VictoryExit: Story = {
  args: {
    presentationMode: "victory-exit",
    log: ["Arin hits Spectral Guard for 22. Spectral Guard is defeated."],
  },
};

export const EscapeExit: Story = {
  args: {
    presentationMode: "escape-exit",
    log: ["Arin escaped!"],
  },
};

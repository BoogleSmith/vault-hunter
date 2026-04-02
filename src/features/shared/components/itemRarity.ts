export interface ItemRarityMeta {
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
}

export function getItemRarityMeta(value: number): ItemRarityMeta {
  const rarity = Math.max(1, Math.min(6, Math.round(value)));

  switch (rarity) {
    case 1:
      return { tier: 1, label: "Common" };
    case 2:
      return { tier: 2, label: "Uncommon" };
    case 3:
      return { tier: 3, label: "Rare" };
    case 4:
      return { tier: 4, label: "Epic" };
    case 5:
      return { tier: 5, label: "Legendary" };
    default:
      return { tier: 6, label: "Mythic" };
  }
}

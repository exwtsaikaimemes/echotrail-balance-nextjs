export const RARITIES = [
  { name: "COMMON", tier: 1 },
  { name: "UNCOMMON", tier: 2 },
  { name: "RARE", tier: 3 },
  { name: "EPIC", tier: 4 },
  { name: "LEGENDARY", tier: 5 },
  { name: "CURSED", tier: 6 },
  { name: "MYTHICAL", tier: 7 },
] as const;

export const RARITY_NAMES = RARITIES.map(r => r.name);

export const RARITY_COLORS: Record<string, string> = {
  COMMON: "#888888",
  UNCOMMON: "#55ff55",
  RARE: "#5555ff",
  EPIC: "#ff55ff",
  LEGENDARY: "#ffaa00",
  CURSED: "#ff6600",
  MYTHICAL: "#ff5555",
};

export const RARITY_GLYPHS: Record<string, string> = {
  COMMON: "\uA44B",
  UNCOMMON: "\uA461",
  RARE: "\uA44C",
  EPIC: "\uA44D",
  LEGENDARY: "\uA44E",
  CURSED: "\uA460",
  MYTHICAL: "\uA44F",
};

export const RARITY_MC_COLORS: Record<string, string> = {
  COMMON: "#555555",
  UNCOMMON: "#55ff55",
  RARE: "#5555ff",
  EPIC: "#ff55ff",
  LEGENDARY: "#ffaa00",
  CURSED: "#ffaa00",
  MYTHICAL: "#ff5555",
};

import type { LoadoutSlot } from "@/types/loadout";

export const SLOT_LABELS: Record<LoadoutSlot, string> = {
  main_hand: "Main Hand",
  off_hand: "Off-Hand",
  helmet: "Helmet",
  chestplate: "Chestplate",
  leggings: "Leggings",
  boots: "Boots",
};

export const SLOT_ICONS: Record<LoadoutSlot, string> = {
  main_hand: "⚔️",
  off_hand: "🛡️",
  helmet: "👑",
  chestplate: "🛡️",
  leggings: "🦵",
  boots: "👢",
};

type EquipClass =
  | "Sword"
  | "Axe"
  | "Mace"
  | "Bow"
  | "Crossbow"
  | "Trident"
  | "Tool"
  | "Shield"
  | "Trinket"
  | "Helmet"
  | "Chestplate"
  | "Elytra"
  | "Leggings"
  | "Boots";

export const SLOT_ELIGIBLE_CLASSES: Record<LoadoutSlot, EquipClass[]> = {
  main_hand: ["Sword", "Axe", "Mace", "Bow", "Crossbow", "Trident", "Tool"],
  off_hand: ["Shield", "Trinket"],
  helmet: ["Helmet"],
  chestplate: ["Chestplate", "Elytra"],
  leggings: ["Leggings"],
  boots: ["Boots"],
};

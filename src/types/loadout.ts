export type LoadoutSlot = "main_hand" | "off_hand" | "helmet" | "chestplate" | "leggings" | "boots";

export type EquippedLoadout = Record<LoadoutSlot, string | null>;  // slot -> item_key

export interface SavedLoadout {
  id: string;
  name: string;
  slots: EquippedLoadout;
  updatedAt: string;
}

export interface LoadoutStat {
  name: string;
  totalMin: number;
  totalMax: number;
  count: number;
}

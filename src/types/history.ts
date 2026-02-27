import type { Item } from "./item";

export interface HistoryEntry {
  id: number;
  itemId: string;
  itemKey: string;
  itemName: string;
  changeType: "created" | "updated" | "deleted";
  changedBy: string;
  budgetBefore: number | null;
  budgetAfter: number | null;
  snapshotBefore: Item | null;
  snapshotAfter: Item | null;
  createdAt: string;
}

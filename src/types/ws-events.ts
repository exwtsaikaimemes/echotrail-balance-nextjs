import type { Item } from "./item";
import type { BalanceConfig } from "./balance";
import type { Comment } from "./comment";

export type WSEvent =
  | { type: "user:connected"; username: string; count: number; users: string[] }
  | { type: "user:disconnected"; username: string; count: number; users: string[] }
  | { type: "item:created"; item: Item; by: string }
  | { type: "item:updated"; item: Item; by: string }
  | { type: "item:deleted"; itemId: string; by: string }
  | { type: "items:cleared"; by: string }
  | { type: "items:synced"; items: Item[]; by: string }
  | { type: "balance:updated"; balanceConfig: BalanceConfig; by: string }
  | { type: "comment:created"; itemId: string; comment: Comment; by: string }
  | { type: "history:new"; entry: { itemId: string; itemKey: string; itemName: string; changeType: string; changedBy: string; budgetBefore: number | null; budgetAfter: number | null }; by: string };

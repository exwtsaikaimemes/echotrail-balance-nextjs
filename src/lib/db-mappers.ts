import pool from "./db";
import type { Item } from "@/types/item";

// ── Helper: safely parse a JSON column that may already be an object ──

function parseJSON<T>(val: unknown): T {
  if (Array.isArray(val) || (typeof val === "object" && val !== null)) return val as T;
  try {
    return JSON.parse((val as string) || "[]");
  } catch {
    return [] as unknown as T;
  }
}

// ── Convert a snake_case DB row into a camelCase Item object ──

export function dbRowToItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    itemKey: row.item_key as string,
    objectName: row.object_name as string,
    customName: row.custom_name as string,
    equipment: row.equipment as string,
    rarity: row.rarity as string,
    usesBaseStats: !!row.uses_base_stats,
    secretItem: !!row.secret_item,
    canDrop: !!row.can_drop,
    isOffHand: !!row.is_off_hand,
    isBothHands: !!row.is_both_hands,
    isTest: !!row.is_test,
    customModelData: (row.custom_model_data as string) || "",
    equippableAssetId: (row.equippable_asset_id as string) || "",
    enchantments: parseJSON(row.enchantments),
    attributes: parseJSON(row.attributes),
    source: (row.source as string) || "manual",
    createdBy: (row.created_by as string) || null,
    modifiedBy: (row.modified_by as string) || null,
    createdAt: row.created_at as string,
    modifiedAt: row.modified_at as string,
  };
}

// ── Convert a camelCase Item to snake_case DB params (for INSERT / UPDATE) ──

export interface DbItemParams {
  id: string;
  item_key: string;
  object_name: string;
  custom_name: string;
  equipment: string;
  rarity: string;
  uses_base_stats: number;
  secret_item: number;
  can_drop: number;
  is_off_hand: number;
  is_both_hands: number;
  is_test: number;
  custom_model_data: string | null;
  equippable_asset_id: string | null;
  enchantments: string;
  attributes: string;
  source: string;
  modified_by: string;
}

export function itemToDbParams(item: Partial<Item> & Pick<Item, "id">, username: string): DbItemParams {
  return {
    id: item.id,
    item_key: item.itemKey ?? "",
    object_name: item.objectName ?? "",
    custom_name: item.customName ?? "",
    equipment: item.equipment ?? "",
    rarity: item.rarity ?? "",
    uses_base_stats: item.usesBaseStats ? 1 : 0,
    secret_item: item.secretItem ? 1 : 0,
    can_drop: item.canDrop !== false ? 1 : 0,
    is_off_hand: item.isOffHand ? 1 : 0,
    is_both_hands: item.isBothHands ? 1 : 0,
    is_test: item.isTest ? 1 : 0,
    custom_model_data: item.customModelData || null,
    equippable_asset_id: item.equippableAssetId || null,
    enchantments: JSON.stringify(item.enchantments || []),
    attributes: JSON.stringify(item.attributes || []),
    source: item.source || "manual",
    modified_by: username,
  };
}

// ── Record an entry in item history ──

export async function recordHistory(
  itemId: string,
  itemKey: string,
  itemName: string,
  changeType: "created" | "updated" | "deleted",
  changedBy: string,
  snapshotBefore: Item | null,
  snapshotAfter: Item | null,
  budgetBefore: number | null | undefined,
  budgetAfter: number | null | undefined,
): Promise<void> {
  await pool.execute(
    `INSERT INTO echotrail_itemmanager_item_history
      (item_id, item_key, item_name, change_type, changed_by, budget_before, budget_after, snapshot_before, snapshot_after)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      itemId,
      itemKey,
      itemName,
      changeType,
      changedBy,
      budgetBefore !== null && budgetBefore !== undefined ? budgetBefore : null,
      budgetAfter !== null && budgetAfter !== undefined ? budgetAfter : null,
      snapshotBefore ? JSON.stringify(snapshotBefore) : null,
      snapshotAfter ? JSON.stringify(snapshotAfter) : null,
    ]
  );
}

import "server-only";
import pool from "./db";
import type { Item } from "@/types/item";
import type { WeightMap } from "@/types/balance";
import { computeBudgetUsedPure } from "./budget";

// ── Server-side: read balance config from DB, compute budget used ──

export async function computeBudgetUsedFromDB(
  item: Pick<Item, "attributes">,
): Promise<number> {
  const [rows] = await pool.execute(
    "SELECT formula, weights FROM echotrail_itemmanager_balance_config WHERE id = 1"
  );
  const typedRows = rows as Array<{ formula: string; weights: string | WeightMap }>;
  if (typedRows.length === 0) return 0;

  const row = typedRows[0];
  const formula = row.formula || "weight_x_max";
  const weights: WeightMap =
    typeof row.weights === "string" ? JSON.parse(row.weights) : row.weights;

  return computeBudgetUsedPure(item.attributes, formula, weights);
}

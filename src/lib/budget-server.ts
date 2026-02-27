import "server-only";
import pool from "./db";
import type { Item } from "@/types/item";
import type { WeightMap } from "@/types/balance";
import { computeBudgetUsedPure } from "./budget";

// ── Server-side: read balance config from DB, compute budget used ──

export async function resolveFormulaExpression(formulaName: string): Promise<string> {
  const [rows] = await pool.execute(
    "SELECT expression FROM echotrail_itemmanager_budget_formulas WHERE name = ?",
    [formulaName]
  ) as any;
  if (rows.length > 0) return rows[0].expression;
  // Fallback: if the value is already an expression (contains operators), return as-is
  if (/[+\-*/^]/.test(formulaName)) return formulaName;
  return "weight * max";
}

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

  const formulaExpression = await resolveFormulaExpression(formula);
  return computeBudgetUsedPure(item.attributes, formulaExpression, weights);
}

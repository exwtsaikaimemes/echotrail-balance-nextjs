import type { Item, ItemAttribute } from "@/types/item";
import type { BalanceConfig, WeightMap, AllowanceMap } from "@/types/balance";
import { getEquipClass } from "@/constants/equipment";
import { evaluateFormula } from "./formula-eval";

// ── Resolve a formula name to its expression ──
// If the formula value looks like an expression (contains operators), use it directly.
// Otherwise it's a formula name — callers should pass the resolved expression.

export function computeAttrCost(
  formulaExpression: string,
  weight: number,
  minVal: number,
  maxVal: number,
): number {
  const vars = {
    weight,
    min: minVal,
    max: maxVal,
    avg: (minVal + maxVal) / 2,
    range: maxVal - minVal,
    value: maxVal,
  };
  return evaluateFormula(formulaExpression, vars);
}

// ── Pure function: compute budget used by an item given weights and formula expression ──

export function computeBudgetUsedPure(
  attributes: ItemAttribute[],
  formulaExpression: string,
  weights: WeightMap,
): number {
  let used = 0;

  for (const attr of attributes) {
    if (attr.bypassBP) continue;

    const weight = weights[attr.name] || 0;
    let totalCost = 0;

    for (const b of attr.bounds) {
      if (b.type === "String") {
        totalCost += weight;
        continue;
      }

      const minVal = parseFloat(b.min) || 0;
      const maxVal = parseFloat(b.max) || 0;
      totalCost += computeAttrCost(formulaExpression, weight, minVal, maxVal);
    }

    used += Math.round(totalCost * 100) / 100;
  }

  return Math.round(used * 100) / 100;
}

// ── Get the budget allowance for an item based on its rarity and equipment class ──

export function getAllowance(
  rarity: string,
  equipment: string,
  allowances: AllowanceMap,
): number {
  const equipClass = getEquipClass(equipment);
  return allowances[rarity]?.[equipClass] ?? 0;
}

// ── Full budget breakdown for an item ──

export interface BudgetBreakdown {
  used: number;
  allowed: number;
  status: "under" | "at" | "over";
  breakdown: Array<{ name: string; cost: number }>;
}

export function computeItemBudget(
  item: Pick<Item, "attributes" | "rarity" | "equipment">,
  config: BalanceConfig,
): BudgetBreakdown {
  const { formula, weights, allowances } = config;

  // Resolve the formula: config.formula now stores the formula expression directly,
  // or a formula name. For backward compatibility, if it doesn't contain operators,
  // fall back to a simple "weight * max" default.
  const formulaExpression = /[+\-*/^]/.test(formula) ? formula : "weight * max";

  const breakdown: Array<{ name: string; cost: number }> = [];

  for (const attr of item.attributes) {
    if (attr.bypassBP) continue;

    const weight = weights[attr.name] || 0;
    let totalCost = 0;

    for (const b of attr.bounds) {
      if (b.type === "String") {
        totalCost += weight;
        continue;
      }

      const minVal = parseFloat(b.min) || 0;
      const maxVal = parseFloat(b.max) || 0;
      totalCost += computeAttrCost(formulaExpression, weight, minVal, maxVal);
    }

    breakdown.push({ name: attr.name, cost: Math.round(totalCost * 100) / 100 });
  }

  const used = Math.round(
    breakdown.reduce((sum, entry) => sum + entry.cost, 0) * 100
  ) / 100;
  const allowed = getAllowance(item.rarity, item.equipment, allowances);

  let status: "under" | "at" | "over";
  if (used < allowed) status = "under";
  else if (used === allowed) status = "at";
  else status = "over";

  return { used, allowed, status, breakdown };
}

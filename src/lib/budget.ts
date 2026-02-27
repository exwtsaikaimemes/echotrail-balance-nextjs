import type { Item, ItemAttribute } from "@/types/item";
import type { BalanceConfig, WeightMap, AllowanceMap } from "@/types/balance";
import { getEquipClass } from "@/constants/equipment";

// ── Pure function: compute budget used by an item given weights and formula ──

export function computeBudgetUsedPure(
  attributes: ItemAttribute[],
  formula: string,
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

      switch (formula) {
        case "weight_x_max":
          totalCost += weight * Math.max(Math.abs(minVal), Math.abs(maxVal));
          break;
        case "weight_x_avg":
          totalCost += weight * Math.abs((minVal + maxVal) / 2);
          break;
        case "weight_x_range":
          totalCost += weight * Math.abs(maxVal - minVal);
          break;
        case "flat_weight":
          totalCost += weight;
          break;
      }
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

      switch (formula) {
        case "weight_x_max":
          totalCost += weight * Math.max(Math.abs(minVal), Math.abs(maxVal));
          break;
        case "weight_x_avg":
          totalCost += weight * Math.abs((minVal + maxVal) / 2);
          break;
        case "weight_x_range":
          totalCost += weight * Math.abs(maxVal - minVal);
          break;
        case "flat_weight":
          totalCost += weight;
          break;
      }
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

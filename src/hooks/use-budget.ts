"use client";

import { useMemo } from "react";
import type { Item } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import { computeItemBudget, type BudgetBreakdown } from "@/lib/budget";

const EMPTY_BUDGET: BudgetBreakdown = {
  used: 0,
  allowed: 0,
  status: "under",
  breakdown: [],
};

export function useBudget(
  item: Pick<Item, "attributes" | "rarity" | "equipment"> | undefined | null,
  balanceConfig: BalanceConfig | undefined | null,
): BudgetBreakdown {
  return useMemo(() => {
    if (!item || !balanceConfig) return EMPTY_BUDGET;
    return computeItemBudget(item, balanceConfig);
  }, [item, balanceConfig]);
}

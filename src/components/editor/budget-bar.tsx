"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import { useBudget } from "@/hooks/use-budget";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BudgetBarProps {
  balanceConfig: BalanceConfig | null;
  showBreakdown?: boolean;
}

export function BudgetBar({ balanceConfig, showBreakdown = true }: BudgetBarProps) {
  const { watch } = useFormContext<Item>();
  const attributes = watch("attributes");
  const rarity = watch("rarity");
  const equipment = watch("equipment");

  const budget = useBudget({ attributes, rarity, equipment }, balanceConfig);

  const percentage =
    budget.allowed > 0
      ? Math.min((budget.used / budget.allowed) * 100, 150)
      : 0;

  const displayPercentage = Math.min(percentage, 100);

  const statusConfig = {
    under: {
      label: "Under Budget",
      color: "text-green-400",
      badgeBg: "bg-green-600/20 text-green-400 border-green-600/30",
      barColor: percentage > 80 ? "bg-yellow-500" : "bg-green-500",
    },
    at: {
      label: "At Limit",
      color: "text-yellow-400",
      badgeBg: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      barColor: "bg-yellow-500",
    },
    over: {
      label: "Over Budget",
      color: "text-red-400",
      badgeBg: "bg-red-600/20 text-red-400 border-red-600/30",
      barColor: "bg-red-500",
    },
  };

  const config = statusConfig[budget.status];

  return (
    <div className="mb-3 p-3 bg-card border rounded-lg">
      <div className="flex items-center gap-3 h-7">
        <span className="text-xs font-medium text-muted-foreground shrink-0">
          Budget:
        </span>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className={cn("font-mono text-sm font-medium shrink-0", config.color)}>
            {budget.used}/{budget.allowed}
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                config.barColor
              )}
              style={{ width: `${displayPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {Math.round(percentage)}%
          </span>
        </div>
        <Badge variant="outline" className={cn("text-xs shrink-0", config.badgeBg)}>
          {config.label}
        </Badge>
      </div>
      {!balanceConfig && (
        <p className="text-xs text-muted-foreground italic mt-1">
          Balance config not loaded
        </p>
      )}
    </div>
  );
}

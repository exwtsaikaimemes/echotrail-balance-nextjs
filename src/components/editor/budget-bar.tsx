"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import { useBudget } from "@/hooks/use-budget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Budget</CardTitle>
          <Badge variant="outline" className={cn("text-xs", config.badgeBg)}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={cn("font-mono font-medium", config.color)}>
              {budget.used}
            </span>
            <span className="text-muted-foreground">
              / {budget.allowed}
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                config.barColor
              )}
              style={{ width: `${displayPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(percentage)}% used
          </p>
        </div>

        {/* Breakdown */}
        {showBreakdown && budget.breakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Breakdown
              </p>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-1">
                  {budget.breakdown.map((entry, index) => (
                    <div
                      key={`${entry.name}-${index}`}
                      className="flex items-center justify-between py-1 px-1 text-xs"
                    >
                      <span className="font-mono text-muted-foreground truncate max-w-[200px]">
                        {entry.name}
                      </span>
                      <span
                        className={cn(
                          "font-mono shrink-0 ml-2",
                          entry.cost > 0 ? "text-yellow-400" : "text-muted-foreground"
                        )}
                      >
                        {entry.cost}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {!balanceConfig && (
          <p className="text-xs text-muted-foreground italic">
            Balance config not loaded. Budget cannot be calculated.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { computeItemBudget, type BudgetBreakdown } from "@/lib/budget";
import { RARITY_COLORS } from "@/constants/rarities";
import { getEquipClass } from "@/constants/equipment";
import type { Item } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import type { SortField, SortDirection } from "@/app/(main)/items/page";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MessageSquare,
  FlaskConical,
} from "lucide-react";

interface ItemTableProps {
  items: Item[];
  balanceConfig: BalanceConfig | null;
  commentCounts: Record<string, number>;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function SortIcon({
  field,
  currentField,
  direction,
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  if (field !== currentField) {
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 ml-1" />
  ) : (
    <ArrowDown className="h-3 w-3 ml-1" />
  );
}

function getBudgetColor(budget: BudgetBreakdown): string {
  if (budget.allowed === 0) return "text-muted-foreground";
  const ratio = budget.used / budget.allowed;
  if (ratio > 1) return "text-red-400";
  if (ratio >= 0.9) return "text-yellow-400";
  return "text-green-400";
}

export function ItemTable({
  items,
  balanceConfig,
  commentCounts,
  sortField,
  sortDirection,
  onSort,
}: ItemTableProps) {
  const router = useRouter();

  const budgetMap = useMemo(() => {
    const map: Record<string, BudgetBreakdown> = {};
    if (!balanceConfig) return map;
    for (const item of items) {
      map[item.id] = computeItemBudget(item, balanceConfig);
    }
    return map;
  }, [items, balanceConfig]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No items found
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters, or create a new item to get started.
        </p>
      </div>
    );
  }

  const columns: { field: SortField; label: string; className?: string }[] = [
    { field: "name", label: "Name", className: "min-w-[200px]" },
    { field: "rarity", label: "Rarity", className: "w-[120px]" },
    { field: "equipment", label: "Equipment", className: "w-[130px]" },
    { field: "budget", label: "Budget", className: "w-[120px]" },
    { field: "attributes", label: "Attrs", className: "w-[80px]" },
    { field: "enchantments", label: "Enchants", className: "w-[90px]" },
    { field: "comments", label: "Comments", className: "w-[100px]" },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.field}
                  className={cn(
                    "cursor-pointer select-none hover:bg-muted/50 transition-colors",
                    col.className
                  )}
                  onClick={() => onSort(col.field)}
                >
                  <span className="flex items-center">
                    {col.label}
                    <SortIcon
                      field={col.field}
                      currentField={sortField}
                      direction={sortDirection}
                    />
                  </span>
                </TableHead>
              ))}
              <TableHead className="w-[70px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const budget = budgetMap[item.id];
              const commentCount = commentCounts[item.id] ?? 0;
              const equipClass = getEquipClass(item.equipment);

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => router.push(`/items/${item.id}`)}
                    >
                      {/* Name */}
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.customName || item.itemKey}</span>
                          {item.customName && item.itemKey !== item.customName && (
                            <span className="text-xs text-muted-foreground">
                              {item.itemKey}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Rarity */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-transparent font-semibold text-xs"
                          style={{
                            color: RARITY_COLORS[item.rarity] ?? "#888",
                            backgroundColor: `${RARITY_COLORS[item.rarity] ?? "#888"}18`,
                          }}
                        >
                          {item.rarity}
                        </Badge>
                      </TableCell>

                      {/* Equipment */}
                      <TableCell>
                        <span className="text-sm">{equipClass}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {item.equipment.split(".")[1]}
                        </span>
                      </TableCell>

                      {/* Budget */}
                      <TableCell>
                        {budget && budget.allowed > 0 ? (
                          <span
                            className={cn(
                              "text-sm font-mono tabular-nums",
                              getBudgetColor(budget)
                            )}
                          >
                            {budget.used}
                            <span className="text-muted-foreground">
                              {" "}/ {budget.allowed}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            --
                          </span>
                        )}
                      </TableCell>

                      {/* Attributes count */}
                      <TableCell>
                        <span className="text-sm tabular-nums">
                          {item.attributes.length}
                        </span>
                      </TableCell>

                      {/* Enchantments count */}
                      <TableCell>
                        <span className="text-sm tabular-nums">
                          {item.enchantments.length}
                        </span>
                      </TableCell>

                      {/* Comments count */}
                      <TableCell>
                        {commentCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="tabular-nums">{commentCount}</span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            --
                          </span>
                        )}
                      </TableCell>

                      {/* Status (Test badge) */}
                      <TableCell>
                        {item.isTest && (
                          <Badge
                            variant="outline"
                            className="text-xs border-yellow-600/50 text-yellow-500 bg-yellow-950/30"
                          >
                            <FlaskConical className="h-3 w-3 mr-1" />
                            Test
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  {item.attributes.length > 0 && (
                    <TooltipContent side="bottom" align="start" className="max-w-sm">
                      <div className="space-y-1">
                        <p className="font-semibold text-xs mb-1.5">
                          Attributes ({item.attributes.length})
                        </p>
                        {item.attributes.map((attr, i) => (
                          <div
                            key={`${attr.name}-${i}`}
                            className="flex items-center justify-between gap-4 text-xs"
                          >
                            <span>
                              <span
                                className={cn(
                                  attr.category === "Custom"
                                    ? "text-blue-400"
                                    : "text-green-400"
                                )}
                              >
                                {attr.name}
                              </span>
                              {attr.bypassBP && (
                                <span className="text-muted-foreground ml-1">
                                  (bypass)
                                </span>
                              )}
                            </span>
                            <span className="text-muted-foreground font-mono">
                              {attr.bounds
                                .map((b) =>
                                  b.type === "String"
                                    ? `"${b.min}"`
                                    : `${b.min}-${b.max}`
                                )
                                .join(", ")}
                            </span>
                          </div>
                        ))}
                        {budget && budget.allowed > 0 && (
                          <div className="border-t border-border pt-1 mt-1.5">
                            <span
                              className={cn(
                                "text-xs font-mono",
                                getBudgetColor(budget)
                              )}
                            >
                              Budget: {budget.used} / {budget.allowed}
                            </span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}

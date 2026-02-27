"use client";

import { useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { cn } from "@/lib/utils";
import { computeItemBudget, type BudgetBreakdown } from "@/lib/budget";
import { RARITY_COLORS } from "@/constants/rarities";
import { getEquipClass } from "@/constants/equipment";
import type { Item } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import type { SortField, SortDirection } from "@/app/(main)/items/page";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MessageSquare,
  FlaskConical,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from "lucide-react";
import type { PatchStatus } from "@/types/history";

const PATCH_STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  new: {
    label: "New",
    className: "border-purple-500/50 text-purple-400 bg-purple-500/10",
    icon: Sparkles,
  },
  buffed: {
    label: "Buffed",
    className: "border-green-500/50 text-green-400 bg-green-500/10",
    icon: TrendingUp,
  },
  nerfed: {
    label: "Nerfed",
    className: "border-red-500/50 text-red-400 bg-red-500/10",
    icon: TrendingDown,
  },
  adjusted: {
    label: "Adjusted",
    className: "border-blue-500/50 text-blue-400 bg-blue-500/10",
    icon: ArrowLeftRight,
  },
};

interface ItemTableProps {
  items: Item[];
  balanceConfig: BalanceConfig | null;
  commentCounts: Record<string, number>;
  patchStatuses: Record<string, PatchStatus>;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  compareSelection?: Set<string>;
  onToggleCompare?: (itemKey: string) => void;
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
  patchStatuses,
  sortField,
  sortDirection,
  onSort,
  compareSelection,
  onToggleCompare,
}: ItemTableProps) {
  const router = useRouter();

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredItemId(id);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredItemId(null);
  }, []);

  const budgetMap = useMemo(() => {
    const map: Record<string, BudgetBreakdown> = {};
    if (!balanceConfig) return map;
    for (const item of items) {
      map[item.id] = computeItemBudget(item, balanceConfig);
    }
    return map;
  }, [items, balanceConfig]);

  const hoveredItem = hoveredItemId
    ? items.find((i) => i.id === hoveredItemId)
    : null;

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
    { field: "id", label: "ID", className: "w-[180px]" },
    { field: "rarity", label: "Rarity", className: "w-[120px]" },
    { field: "equipment", label: "Equipment", className: "w-[130px]" },
    { field: "budget", label: "Budget", className: "w-[120px]" },
    { field: "attributes", label: "Attrs", className: "w-[80px]" },
    { field: "enchantments", label: "Enchants", className: "w-[90px]" },
    { field: "comments", label: "Comments", className: "w-[100px]" },
    { field: "patch", label: "Patch", className: "w-[90px]" },
  ];

  const tooltipBudget = hoveredItemId ? budgetMap[hoveredItemId] : undefined;

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {onToggleCompare && (
                <TableHead className="w-10" />
              )}
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
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/items/${item.itemKey}`)}
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Compare checkbox */}
                  {onToggleCompare && (
                    <TableCell className="w-10">
                      <Checkbox
                        checked={compareSelection?.has(item.itemKey) ?? false}
                        disabled={
                          !compareSelection?.has(item.itemKey) &&
                          (compareSelection?.size ?? 0) >= 2
                        }
                        onCheckedChange={() => onToggleCompare(item.itemKey)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}

                  {/* Name */}
                  <TableCell className="font-medium">
                    {item.customName || item.itemKey}
                  </TableCell>

                  {/* ID */}
                  <TableCell>
                    <code className="text-xs font-mono text-muted-foreground">
                      {item.itemKey}
                    </code>
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

                  {/* Patch status */}
                  <TableCell>
                    {(() => {
                      const status = patchStatuses[item.id];
                      if (!status) return <span className="text-sm text-muted-foreground">--</span>;
                      const cfg = PATCH_STATUS_CONFIG[status];
                      if (!cfg) return <span className="text-sm text-muted-foreground">--</span>;
                      const Icon = cfg.icon;
                      return (
                        <Badge variant="outline" className={cn("text-xs", cfg.className)}>
                          <Icon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      );
                    })()}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cursor-following tooltip */}
      {hoveredItem &&
        hoveredItem.attributes.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 max-w-sm rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md"
            style={{
              left: mousePos.x + 12,
              top: mousePos.y + 16,
            }}
          >
            <div className="space-y-1">
              <p className="font-semibold text-xs mb-1.5">
                Attributes ({hoveredItem.attributes.length})
              </p>
              {hoveredItem.attributes.map((attr, i) => (
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
              {tooltipBudget && tooltipBudget.allowed > 0 && (
                <div className="border-t border-border pt-1 mt-1.5">
                  <span
                    className={cn(
                      "text-xs font-mono",
                      getBudgetColor(tooltipBudget)
                    )}
                  >
                    Budget: {tooltipBudget.used} / {tooltipBudget.allowed}
                  </span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

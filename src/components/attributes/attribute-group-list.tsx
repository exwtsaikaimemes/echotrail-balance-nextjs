"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { AttributeGroupItemRow } from "./attribute-group-item-row";
import { RARITIES } from "@/constants/rarities";
import { getEquipClass } from "@/constants/equipment";
import type { Item, ItemAttribute } from "@/types/item";
import type { AttributeDef } from "@/types/balance";

export interface AttributeGroup {
  attributeName: string;
  category: "Custom" | "Vanilla";
  def: AttributeDef | undefined;
  items: Array<{ item: Item; attribute: ItemAttribute }>;
}

type ItemSortField = "name" | "rarity" | "equipment";
type SortDir = "asc" | "desc";

const RARITY_ORDER: Record<string, number> = Object.fromEntries(
  RARITIES.map((r) => [r.name, r.tier])
);

function ItemSortIcon({
  field,
  currentField,
  direction,
}: {
  field: ItemSortField;
  currentField: ItemSortField;
  direction: SortDir;
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

interface AttributeGroupListProps {
  groups: AttributeGroup[];
  expanded: Set<string>;
  onToggleGroup: (name: string) => void;
}

export function AttributeGroupList({
  groups,
  expanded,
  onToggleGroup,
}: AttributeGroupListProps) {
  const [itemSortField, setItemSortField] = useState<ItemSortField>("name");
  const [itemSortDir, setItemSortDir] = useState<SortDir>("asc");

  function handleItemSort(field: ItemSortField) {
    if (field === itemSortField) {
      setItemSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setItemSortField(field);
      setItemSortDir("asc");
    }
  }

  function sortItems(items: AttributeGroup["items"]) {
    return [...items].sort((a, b) => {
      let cmp = 0;
      switch (itemSortField) {
        case "name":
          cmp = a.item.customName.localeCompare(b.item.customName);
          break;
        case "rarity":
          cmp =
            (RARITY_ORDER[a.item.rarity] ?? 0) -
            (RARITY_ORDER[b.item.rarity] ?? 0);
          break;
        case "equipment":
          cmp = getEquipClass(a.item.equipment).localeCompare(
            getEquipClass(b.item.equipment)
          );
          break;
      }
      return itemSortDir === "asc" ? cmp : -cmp;
    });
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No attributes found
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isExpanded = expanded.has(group.attributeName);

        return (
          <div
            key={group.attributeName}
            className="rounded-md border"
          >
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              onClick={() => onToggleGroup(group.attributeName)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <Badge
                variant="outline"
                className={cn(
                  "text-xs border-transparent font-medium",
                  group.category === "Custom"
                    ? "text-blue-400 bg-blue-400/10"
                    : "text-green-400 bg-green-400/10"
                )}
              >
                {group.category}
              </Badge>

              <span className="font-mono text-sm font-medium">
                {group.attributeName}
              </span>

              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {group.items.length} {group.items.length === 1 ? "item" : "items"}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="min-w-[200px] cursor-pointer select-none"
                        onClick={() => handleItemSort("name")}
                      >
                        <span className="inline-flex items-center">
                          Item Name
                          <ItemSortIcon field="name" currentField={itemSortField} direction={itemSortDir} />
                        </span>
                      </TableHead>
                      <TableHead
                        className="w-[120px] cursor-pointer select-none"
                        onClick={() => handleItemSort("rarity")}
                      >
                        <span className="inline-flex items-center">
                          Rarity
                          <ItemSortIcon field="rarity" currentField={itemSortField} direction={itemSortDir} />
                        </span>
                      </TableHead>
                      <TableHead
                        className="w-[130px] cursor-pointer select-none"
                        onClick={() => handleItemSort("equipment")}
                      >
                        <span className="inline-flex items-center">
                          Equipment
                          <ItemSortIcon field="equipment" currentField={itemSortField} direction={itemSortDir} />
                        </span>
                      </TableHead>
                      <TableHead className="w-[200px]">Bound Values</TableHead>
                      <TableHead className="w-[80px]">Bypass BP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortItems(group.items).map(({ item, attribute }, i) => (
                      <AttributeGroupItemRow
                        key={`${item.id}-${i}`}
                        item={item}
                        attribute={attribute}
                        def={group.def}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

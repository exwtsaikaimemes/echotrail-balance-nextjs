"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useItems, useItemPatchStatuses } from "@/hooks/use-items";
import { useBalanceConfig } from "@/hooks/use-balance";
import { useCommentCounts } from "@/hooks/use-comments";
import { useDebounce } from "@/hooks/use-debounce";
import { useCookieState } from "@/hooks/use-cookie-state";
import { computeItemBudget } from "@/lib/budget";
import { ItemTableToolbar } from "@/components/browser/item-table-toolbar";
import { ItemTable } from "@/components/browser/item-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Item } from "@/types/item";
import { getEquipClass } from "@/constants/equipment";
import { GitCompareArrows } from "lucide-react";

export type SortField =
  | "name"
  | "id"
  | "rarity"
  | "equipment"
  | "budget"
  | "attributes"
  | "enchantments"
  | "comments"
  | "patch";
export type SortDirection = "asc" | "desc";
export type TestFilter = "all" | "test" | "live";

const RARITY_ORDER: Record<string, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  CURSED: 6,
  MYTHICAL: 7,
};

export default function ItemsPage() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: balanceConfig, isLoading: balanceLoading } = useBalanceConfig();
  const { data: commentCounts } = useCommentCounts();
  const { data: patchStatuses } = useItemPatchStatuses();

  const [searchQuery, setSearchQuery] = useCookieState("search-query", "");
  const [rarityFilter, setRarityFilter] = useCookieState<string>("rarity-filter", "ALL");
  const [equipmentFilter, setEquipmentFilter] = useCookieState<string>("equipment-filter", "ALL");
  const [testFilter, setTestFilter] = useCookieState<TestFilter>("test-filter", "all");
  const [sortField, setSortField] = useCookieState<SortField>("sort-field", "name");
  const [sortDirection, setSortDirection] = useCookieState<SortDirection>("sort-dir", "asc");
  const [compareSelection, setCompareSelection] = useState<Set<string>>(new Set());

  const handleToggleCompare = useCallback((itemKey: string) => {
    setCompareSelection((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else if (next.size < 2) {
        next.add(itemKey);
      }
      return next;
    });
  }, []);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredAndSortedItems = useMemo(() => {
    if (!items) return [];

    let result = [...items];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.customName.toLowerCase().includes(query) ||
          item.itemKey.toLowerCase().includes(query) ||
          item.objectName.toLowerCase().includes(query)
      );
    }

    // Rarity filter
    if (rarityFilter !== "ALL") {
      result = result.filter((item) => item.rarity === rarityFilter);
    }

    // Equipment filter
    if (equipmentFilter !== "ALL") {
      result = result.filter(
        (item) => getEquipClass(item.equipment) === equipmentFilter
      );
    }

    // Test filter
    if (testFilter === "test") {
      result = result.filter((item) => item.isTest);
    } else if (testFilter === "live") {
      result = result.filter((item) => !item.isTest);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.customName.localeCompare(b.customName);
          break;
        case "id":
          comparison = a.itemKey.localeCompare(b.itemKey);
          break;
        case "rarity":
          comparison =
            (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0);
          break;
        case "equipment":
          comparison = a.equipment.localeCompare(b.equipment);
          break;
        case "budget": {
          if (!balanceConfig) { comparison = 0; break; }
          const aBudget = computeItemBudget(a, balanceConfig);
          const bBudget = computeItemBudget(b, balanceConfig);
          const aRatio = aBudget.allowed > 0 ? aBudget.used / aBudget.allowed : 0;
          const bRatio = bBudget.allowed > 0 ? bBudget.used / bBudget.allowed : 0;
          comparison = aRatio - bRatio;
          break;
        }
        case "attributes":
          comparison = a.attributes.length - b.attributes.length;
          break;
        case "enchantments":
          comparison = a.enchantments.length - b.enchantments.length;
          break;
        case "comments": {
          const aCount = commentCounts?.[a.id] ?? 0;
          const bCount = commentCounts?.[b.id] ?? 0;
          comparison = aCount - bCount;
          break;
        }
        case "patch": {
          const patchRank: Record<string, number> = { new: 4, buffed: 3, nerfed: 2, adjusted: 1 };
          const aRank = patchRank[patchStatuses?.[a.id] ?? ""] ?? 0;
          const bRank = patchRank[patchStatuses?.[b.id] ?? ""] ?? 0;
          comparison = aRank - bRank;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    items,
    debouncedSearch,
    rarityFilter,
    equipmentFilter,
    testFilter,
    sortField,
    sortDirection,
    commentCounts,
    patchStatuses,
    balanceConfig,
  ]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const isLoading = itemsLoading || balanceLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-sm text-muted-foreground">
            {items
              ? `${filteredAndSortedItems.length} of ${items.length} items`
              : "Loading items..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareSelection.size === 1 && (
            <span className="text-sm text-muted-foreground">
              Select 1 more to compare
            </span>
          )}
          {compareSelection.size === 2 && (
            <Button asChild size="sm">
              <Link
                href={`/compare?a=${[...compareSelection][0]}&b=${[...compareSelection][1]}`}
              >
                <GitCompareArrows className="mr-2 h-4 w-4" />
                Compare Selected
              </Link>
            </Button>
          )}
        </div>
      </div>

      <ItemTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        rarityFilter={rarityFilter}
        onRarityChange={setRarityFilter}
        equipmentFilter={equipmentFilter}
        onEquipmentChange={setEquipmentFilter}
        testFilter={testFilter}
        onTestFilterChange={setTestFilter}
        items={items ?? []}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <ItemTable
          items={filteredAndSortedItems}
          balanceConfig={balanceConfig ?? null}
          commentCounts={commentCounts ?? {}}
          patchStatuses={patchStatuses ?? {}}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          compareSelection={compareSelection}
          onToggleCompare={handleToggleCompare}
        />
      )}
    </div>
  );
}

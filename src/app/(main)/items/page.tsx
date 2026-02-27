"use client";

import { useState, useMemo } from "react";
import { useItems } from "@/hooks/use-items";
import { useBalanceConfig } from "@/hooks/use-balance";
import { useCommentCounts } from "@/hooks/use-comments";
import { useDebounce } from "@/hooks/use-debounce";
import { ItemTableToolbar } from "@/components/browser/item-table-toolbar";
import { ItemTable } from "@/components/browser/item-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Item } from "@/types/item";
import { getEquipClass } from "@/constants/equipment";

export type SortField =
  | "name"
  | "rarity"
  | "equipment"
  | "budget"
  | "attributes"
  | "enchantments"
  | "comments";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("ALL");
  const [testFilter, setTestFilter] = useState<TestFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
        case "rarity":
          comparison =
            (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0);
          break;
        case "equipment":
          comparison = a.equipment.localeCompare(b.equipment);
          break;
        case "budget":
          // Budget sorting is handled in the table since it needs the balance config
          comparison = 0;
          break;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-sm text-muted-foreground">
            {items
              ? `${filteredAndSortedItems.length} of ${items.length} items`
              : "Loading items..."}
          </p>
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
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}
    </div>
  );
}

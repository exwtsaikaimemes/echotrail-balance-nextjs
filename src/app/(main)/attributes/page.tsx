"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useItems } from "@/hooks/use-items";
import { useBalanceConfig } from "@/hooks/use-balance";
import { useDebounce } from "@/hooks/use-debounce";
import { useCookieState } from "@/hooks/use-cookie-state";
import { AttributeToolbar } from "@/components/attributes/attribute-toolbar";
import {
  AttributeGroupList,
  type AttributeGroup,
} from "@/components/attributes/attribute-group-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getEquipClass } from "@/constants/equipment";
import type {
  CategoryFilter,
  AttrSortField,
  SortDirection,
} from "@/components/attributes/attribute-toolbar";

const SESSION_KEY = "attr-expanded";

function readSessionExpanded(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore corrupt data
  }
  return new Set();
}

export default function AttributesPage() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: balanceConfig, isLoading: balanceLoading } = useBalanceConfig();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [rarityFilter, setRarityFilter] = useState<string>("ALL");
  const [equipmentFilter, setEquipmentFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useCookieState<AttrSortField>("attr-sort-field", "name");
  const [sortDirection, setSortDirection] = useCookieState<SortDirection>("attr-sort-dir", "asc");

  const [expanded, setExpanded] = useState<Set<string>>(readSessionExpanded);

  // Persist expanded state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...expanded]));
    } catch {
      // sessionStorage full or unavailable
    }
  }, [expanded]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const groups = useMemo(() => {
    if (!items) return [];

    const defs = balanceConfig?.attributeDefs ?? {};
    const query = debouncedSearch.toLowerCase();

    // Build groups: Map<attrName, AttributeGroup>
    const groupMap = new Map<string, AttributeGroup>();

    for (const item of items) {
      for (const attr of item.attributes) {
        let group = groupMap.get(attr.name);
        if (!group) {
          group = {
            attributeName: attr.name,
            category: attr.category,
            def: defs[attr.name],
            items: [],
          };
          groupMap.set(attr.name, group);
        }
        group.items.push({ item, attribute: attr });
      }
    }

    let result = Array.from(groupMap.values());

    // Category filter
    if (categoryFilter !== "ALL") {
      result = result.filter((g) => g.category === categoryFilter);
    }

    // Search filter — matches attr name → show whole group; matches item name → show only that item
    if (query) {
      result = result
        .map((g) => {
          if (g.attributeName.toLowerCase().includes(query)) {
            return g; // attr name matches → keep all items
          }
          const filteredItems = g.items.filter(
            ({ item }) =>
              item.customName.toLowerCase().includes(query) ||
              item.itemKey.toLowerCase().includes(query)
          );
          if (filteredItems.length === 0) return null;
          return { ...g, items: filteredItems };
        })
        .filter((g): g is AttributeGroup => g !== null);
    }

    // Rarity filter — filter items within groups, drop empty groups
    if (rarityFilter !== "ALL") {
      result = result
        .map((g) => ({
          ...g,
          items: g.items.filter(({ item }) => item.rarity === rarityFilter),
        }))
        .filter((g) => g.items.length > 0);
    }

    // Equipment filter
    if (equipmentFilter !== "ALL") {
      result = result
        .map((g) => ({
          ...g,
          items: g.items.filter(
            ({ item }) => getEquipClass(item.equipment) === equipmentFilter
          ),
        }))
        .filter((g) => g.items.length > 0);
    }

    // Sort groups
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.attributeName.localeCompare(b.attributeName);
      } else {
        comparison = a.items.length - b.items.length;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    items,
    balanceConfig,
    debouncedSearch,
    categoryFilter,
    rarityFilter,
    equipmentFilter,
    sortField,
    sortDirection,
  ]);

  const isLoading = itemsLoading || balanceLoading;

  const totalAttrs = useMemo(() => {
    if (!items) return 0;
    const names = new Set<string>();
    for (const item of items) {
      for (const attr of item.attributes) {
        names.add(attr.name);
      }
    }
    return names.size;
  }, [items]);

  const handleToggleGroup = useCallback((name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpanded(new Set(groups.map((g) => g.attributeName)));
  }, [groups]);

  const handleCollapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
          <p className="text-sm text-muted-foreground">
            {items
              ? `${groups.length} of ${totalAttrs} attributes`
              : "Loading attributes..."}
          </p>
        </div>
      </div>

      <AttributeToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        rarityFilter={rarityFilter}
        onRarityChange={setRarityFilter}
        equipmentFilter={equipmentFilter}
        onEquipmentChange={setEquipmentFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionToggle={() =>
          setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
        }
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <AttributeGroupList
          groups={groups}
          expanded={expanded}
          onToggleGroup={handleToggleGroup}
        />
      )}
    </div>
  );
}

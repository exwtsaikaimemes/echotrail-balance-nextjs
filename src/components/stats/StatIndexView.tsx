"use client";

import { useState, useMemo } from "react";
import { useItems } from "@/hooks/use-items";
import { RARITY_NAMES, RARITY_COLORS } from "@/constants/rarities";
import EquipButton from "@/components/shared/EquipButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Item } from "@/types/item";

type SortField = "name" | "value";
type SortDir = "asc" | "desc";

export default function StatIndexView() {
  const { data: allItems, isLoading } = useItems();
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  if (isLoading) {
    return <div className="p-8">Loading items...</div>;
  }

  if (!allItems) {
    return <div className="p-8">Error loading items</div>;
  }

  // Get all unique stats with their item counts
  const allStats = useMemo(() => {
    const statsMap = new Map<string, Set<string>>();

    allItems.forEach((item) => {
      item.attributes.forEach((attr) => {
        if (!statsMap.has(attr.name)) {
          statsMap.set(attr.name, new Set());
        }
        statsMap.get(attr.name)!.add(item.itemKey);
      });
    });

    return Array.from(statsMap.entries())
      .map(([name, items]) => ({
        name,
        count: items.size,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allItems]);

  // Filter stats by search
  const filteredStats = useMemo(() => {
    return allStats.filter((stat) =>
      stat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allStats, searchQuery]);

  // Get items with selected stat
  const itemsWithStat = useMemo(() => {
    if (!selectedStat) return [];

    let items = allItems.filter((item) =>
      item.attributes.some((attr) => attr.name === selectedStat)
    );

    // Apply rarity filter
    if (rarityFilter !== "all") {
      items = items.filter((item) => item.rarity === rarityFilter);
    }

    // Sort items
    items.sort((a, b) => {
      let cmp = 0;

      if (sortField === "name") {
        cmp = a.customName.localeCompare(b.customName);
      } else if (sortField === "value") {
        const aAttr = a.attributes.find((attr) => attr.name === selectedStat);
        const bAttr = b.attributes.find((attr) => attr.name === selectedStat);

        const aVal = parseFloat(aAttr?.bounds[0]?.max || "0") || 0;
        const bVal = parseFloat(bAttr?.bounds[0]?.max || "0") || 0;

        cmp = aVal - bVal;
      }

      return sortDir === "desc" ? -cmp : cmp;
    });

    return items;
  }, [selectedStat, allItems, rarityFilter, sortField, sortDir]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Panel: Stat List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Stats</h2>
        <Input
          placeholder="Search stats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredStats.length === 0 ? (
            <div className="text-sm text-slate-500 p-4 text-center">
              No stats found
            </div>
          ) : (
            filteredStats.map((stat) => (
              <button
                key={stat.name}
                onClick={() => setSelectedStat(stat.name)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedStat === stat.name
                    ? "bg-blue-100 dark:bg-blue-900 border-l-2 border-blue-500"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{stat.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stat.count}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Items with Selected Stat */}
      <div className="space-y-4">
        {selectedStat ? (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {selectedStat} ({itemsWithStat.length} items)
              </h2>

              <div className="flex gap-3 mb-4">
                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    {RARITY_NAMES.map((rarity) => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Value (High to Low)</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                >
                  {sortDir === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>

            {itemsWithStat.length === 0 ? (
              <div className="text-sm text-slate-500 p-8 text-center border rounded">
                No items with this stat
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="w-[100px]">Rarity</TableHead>
                      <TableHead className="w-[100px]">Value</TableHead>
                      <TableHead className="w-[100px]">Equipment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsWithStat.map((item) => {
                      const attr = item.attributes.find(
                        (a) => a.name === selectedStat
                      );
                      const value = attr?.bounds[0]?.max || "—";

                      return (
                        <TableRow key={item.itemKey}>
                          <TableCell className="font-medium">{item.customName}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-transparent font-semibold text-xs"
                              style={{
                                color: RARITY_COLORS[item.rarity] ?? "#888",
                                backgroundColor: `${
                                  RARITY_COLORS[item.rarity] ?? "#888"
                                }18`,
                              }}
                            >
                              {item.rarity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{value}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {item.equipment}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Link href={`/items/${item.itemKey}`} passHref legacyBehavior>
                              <Button variant="ghost" size="sm" asChild>
                                <a>
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            </Link>
                            <EquipButton item={item} variant="ghost" showIcon={true} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Select a stat to view items
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RARITY_NAMES, RARITY_COLORS } from "@/constants/rarities";
import { EQUIP_CLASSES } from "@/constants/equipment";
import { Search, ArrowUpDown, ChevronsDown, ChevronsUp } from "lucide-react";

export type CategoryFilter = "ALL" | "Custom" | "Vanilla";
export type AttrSortField = "name" | "count";
export type SortDirection = "asc" | "desc";

interface AttributeToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  rarityFilter: string;
  onRarityChange: (value: string) => void;
  equipmentFilter: string;
  onEquipmentChange: (value: string) => void;
  sortField: AttrSortField;
  onSortFieldChange: (value: AttrSortField) => void;
  sortDirection: SortDirection;
  onSortDirectionToggle: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function AttributeToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  rarityFilter,
  onRarityChange,
  equipmentFilter,
  onEquipmentChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionToggle,
  onExpandAll,
  onCollapseAll,
}: AttributeToolbarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search attributes or items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-1">
        {(["ALL", "Custom", "Vanilla"] as const).map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(cat)}
          >
            {cat === "ALL" ? "All" : cat}
          </Button>
        ))}
      </div>

      <Select value={rarityFilter} onValueChange={onRarityChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Rarity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Rarities</SelectItem>
          {RARITY_NAMES.map((rarity) => (
            <SelectItem key={rarity} value={rarity}>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: RARITY_COLORS[rarity] }}
                />
                {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={equipmentFilter} onValueChange={onEquipmentChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Equipment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          {EQUIP_CLASSES.map((equipClass) => (
            <SelectItem key={equipClass} value={equipClass}>
              {equipClass}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as AttrSortField)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Sort: Name</SelectItem>
          <SelectItem value="count">Sort: Item Count</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={onSortDirectionToggle}>
        <ArrowUpDown className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onExpandAll} title="Expand all groups">
        <ChevronsDown className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onCollapseAll} title="Collapse all groups">
        <ChevronsUp className="h-4 w-4" />
      </Button>
    </div>
  );
}

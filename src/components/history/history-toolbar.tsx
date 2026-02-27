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
import { Search, X } from "lucide-react";

export type ChangeTypeFilter = "all" | "created" | "updated" | "deleted";

interface HistoryToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: ChangeTypeFilter;
  onTypeFilterChange: (value: ChangeTypeFilter) => void;
}

export function HistoryToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: HistoryToolbarProps) {
  const hasFilters = searchQuery !== "" || typeFilter !== "all";

  function handleClear() {
    onSearchChange("");
    onTypeFilterChange("all");
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by item name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={typeFilter}
        onValueChange={(v) => onTypeFilterChange(v as ChangeTypeFilter)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="updated">Updated</SelectItem>
          <SelectItem value="deleted">Deleted</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

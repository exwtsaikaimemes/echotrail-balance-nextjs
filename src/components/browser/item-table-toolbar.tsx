"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportCSVDialog } from "./import-csv-dialog";
import { ImportJSONDialog } from "./import-json-dialog";
import { ClearItemsDialog } from "./clear-items-dialog";
import { exportCSV } from "@/lib/csv-parser";
import { RARITY_NAMES, RARITY_COLORS } from "@/constants/rarities";
import { EQUIP_CLASSES } from "@/constants/equipment";
import type { Item } from "@/types/item";
import type { TestFilter } from "@/app/(main)/items/page";
import {
  Search,
  Plus,
  Upload,
  Download,
  FileJson,
  Trash2,
} from "lucide-react";

interface ItemTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  rarityFilter: string;
  onRarityChange: (value: string) => void;
  equipmentFilter: string;
  onEquipmentChange: (value: string) => void;
  testFilter: TestFilter;
  onTestFilterChange: (value: TestFilter) => void;
  items: Item[];
}

export function ItemTableToolbar({
  searchQuery,
  onSearchChange,
  rarityFilter,
  onRarityChange,
  equipmentFilter,
  onEquipmentChange,
  testFilter,
  onTestFilterChange,
  items,
}: ItemTableToolbarProps) {
  const { data: session } = useSession();
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  function handleExportCSV() {
    if (!items.length) return;
    const csv = exportCSV(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `echotrail_items_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Top row: Search + Filters + New Item */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={rarityFilter} onValueChange={onRarityChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
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
            <SelectTrigger className="w-full sm:w-[150px]">
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

          <Select
            value={testFilter}
            onValueChange={(v) => onTestFilterChange(v as TestFilter)}
          >
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="test">Test Only</SelectItem>
              <SelectItem value="live">Live Only</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:block flex-1" />

          <Button asChild className="w-full sm:w-auto">
            <Link href="/items/new">
              <Plus className="h-4 w-4" />
              New Item
            </Link>
          </Button>
        </div>

        {/* Bottom row: Import/Export actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setJsonDialogOpen(true)}
          >
            <FileJson className="h-4 w-4" />
            Import JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!items.length}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          {isAdmin && (
            <>
              <div className="flex-1" />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setClearDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      <ImportCSVDialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen} />
      <ImportJSONDialog
        open={jsonDialogOpen}
        onOpenChange={setJsonDialogOpen}
      />
      <ClearItemsDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
      />
    </>
  );
}

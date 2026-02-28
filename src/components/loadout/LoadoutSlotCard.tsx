"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SLOT_LABELS, SLOT_ICONS } from "@/constants/loadout";
import { RARITY_COLORS } from "@/constants/rarities";
import { Badge } from "@/components/ui/badge";
import type { LoadoutSlot } from "@/types/loadout";
import type { Item } from "@/types/item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X } from "lucide-react";
import { getEligibleSlots } from "@/lib/loadout-utils";

const RARITY_ORDER: Record<string, number> = {
  COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, CURSED: 6, MYTHICAL: 7,
};

interface LoadoutSlotCardProps {
  slot: LoadoutSlot;
  itemKey: string | null;
  allItems: Item[];
  onEquip: (slot: LoadoutSlot, itemKey: string | null) => void;
  onUnequip?: (slot: LoadoutSlot) => void;
}

export default function LoadoutSlotCard({
  slot,
  itemKey,
  allItems,
  onEquip,
  onUnequip,
}: LoadoutSlotCardProps) {
  const [open, setOpen] = useState(false);
  const item = itemKey ? allItems.find((i) => i.itemKey === itemKey) : null;

  // Filter eligible items (only those that can equip to this slot)
  const eligibleItems = useMemo(() => {
    return allItems.filter((item) => getEligibleSlots(item).includes(slot));
  }, [allItems, slot]);

  // Sort by rarity desc, then name asc
  const sortedItems = useMemo(() => {
    return [...eligibleItems].sort((a, b) => {
      const rarityDiff = (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
      if (rarityDiff !== 0) return rarityDiff;
      return (a.customName || a.itemKey).localeCompare(b.customName || b.itemKey);
    });
  }, [eligibleItems]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{SLOT_ICONS[slot]}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {SLOT_LABELS[slot]}
              </div>
              {item ? (
                <div className="mt-2">
                  <div
                    className="font-medium text-sm"
                    style={{ color: RARITY_COLORS[item.rarity] ?? "#888" }}
                  >
                    {item.customName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.equipment}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  Empty
                </div>
              )}
            </div>
            {item && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnequip?.(slot);
                }}
                title="Unequip"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            {itemKey && (
              <CommandItem
                onSelect={() => {
                  onEquip(slot, null);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-sm">Clear slot</span>
              </CommandItem>
            )}
            {sortedItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.customName} ${item.itemKey}`}
                onSelect={() => {
                  onEquip(slot, item.itemKey);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className="truncate font-medium text-sm">
                    {item.customName || item.itemKey}
                  </span>
                  <code className="text-xs font-mono text-muted-foreground shrink-0">
                    {item.itemKey}
                  </code>
                  <Badge
                    variant="outline"
                    className="ml-auto shrink-0 border-transparent text-[10px] px-1.5 py-0"
                    style={{
                      color: RARITY_COLORS[item.rarity] ?? "#888",
                      backgroundColor: `${RARITY_COLORS[item.rarity] ?? "#888"}18`,
                    }}
                  >
                    {item.rarity}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

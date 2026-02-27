"use client";

import { useState, useMemo } from "react";

const RARITY_ORDER: Record<string, number> = {
  COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, CURSED: 6, MYTHICAL: 7,
};
import { useItems } from "@/hooks/use-items";
import { RARITY_COLORS } from "@/constants/rarities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ChevronsUpDown } from "lucide-react";

interface ItemPickerProps {
  selectedKey?: string | null;
  onSelect: (itemKey: string) => void;
}

export function ItemPicker({ selectedKey, onSelect }: ItemPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: items } = useItems();

  const selectedItem = useMemo(
    () => items?.find((i) => i.itemKey === selectedKey),
    [items, selectedKey]
  );

  const sortedItems = useMemo(() => {
    if (!items) return [];
    return [...items].sort((a, b) => {
      const rarityDiff = (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
      if (rarityDiff !== 0) return rarityDiff;
      return (a.customName || a.itemKey).localeCompare(b.customName || b.itemKey);
    });
  }, [items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[260px] justify-between"
        >
          <span className="truncate">
            {selectedItem ? selectedItem.customName || selectedItem.itemKey : "Select item..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or key..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            {sortedItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.customName} ${item.itemKey}`}
                onSelect={() => {
                  onSelect(item.itemKey);
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

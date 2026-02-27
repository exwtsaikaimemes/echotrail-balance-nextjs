"use client";

import { useState, useMemo } from "react";
import type { ItemAttribute, ItemBound } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import {
  CUSTOM_ATTRIBUTES,
  VANILLA_ATTRIBUTES,
} from "@/constants/attributes";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Plus } from "lucide-react";

interface AttributeSelectorProps {
  existingNames: string[];
  onSelect: (attribute: ItemAttribute) => void;
  balanceConfig: BalanceConfig | null;
}

export function AttributeSelector({
  existingNames,
  onSelect,
  balanceConfig,
}: AttributeSelectorProps) {
  const [open, setOpen] = useState(false);

  const existingSet = useMemo(() => new Set(existingNames), [existingNames]);

  const availableCustom = useMemo(
    () => CUSTOM_ATTRIBUTES.filter((a) => !existingSet.has(a)),
    [existingSet]
  );

  const availableVanilla = useMemo(
    () => VANILLA_ATTRIBUTES.filter((a) => !existingSet.has(a)),
    [existingSet]
  );

  function buildDefaultBounds(
    attrName: string,
    _category: "Custom" | "Vanilla"
  ): ItemBound[] {
    const def = balanceConfig?.attributeDefs?.[attrName];
    if (def && def.bounds.length > 0) {
      return def.bounds.map((b) => ({
        type: b.type,
        min: b.type === "String" ? "" : "0",
        max: b.type === "String" ? "" : "0",
      }));
    }
    // Default: single Double bound
    return [{ type: "Double", min: "0", max: "0" }];
  }

  function handleSelect(name: string, category: "Custom" | "Vanilla") {
    const attribute: ItemAttribute = {
      category,
      name,
      bounds: buildDefaultBounds(name, category),
    };
    onSelect(attribute);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Attribute
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search attributes..." />
          <CommandList>
            <CommandEmpty>No attributes found.</CommandEmpty>
            {availableCustom.length > 0 && (
              <CommandGroup heading="Custom Attributes">
                {availableCustom.map((name) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => handleSelect(name, "Custom")}
                  >
                    <span className="font-mono text-xs">{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {availableCustom.length > 0 && availableVanilla.length > 0 && (
              <CommandSeparator />
            )}
            {availableVanilla.length > 0 && (
              <CommandGroup heading="Vanilla Attributes">
                {availableVanilla.map((name) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={() => handleSelect(name, "Vanilla")}
                  >
                    <span className="font-mono text-xs">{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

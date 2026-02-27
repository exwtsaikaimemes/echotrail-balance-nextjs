"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EnchantmentRowProps {
  index: number;
  onRemove: () => void;
}

export function EnchantmentRow({ index, onRemove }: EnchantmentRowProps) {
  const { watch, setValue } = useFormContext<Item>();

  const enchantment = watch(`enchantments.${index}`);
  const name = enchantment?.name ?? "";
  const level = enchantment?.level ?? 1;

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
      <Badge
        variant="secondary"
        className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 font-mono text-xs shrink-0"
      >
        Enchantment
      </Badge>
      <span className="font-mono text-sm flex-1 truncate">{name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">Level</span>
        <Input
          type="number"
          min={1}
          max={10}
          value={level}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1 && val <= 10) {
              setValue(`enchantments.${index}.level`, val, {
                shouldDirty: true,
              });
            }
          }}
          className="h-8 w-16 text-sm font-mono text-center"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

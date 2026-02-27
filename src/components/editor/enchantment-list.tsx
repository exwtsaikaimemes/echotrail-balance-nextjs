"use client";

import { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { ENCHANTMENTS } from "@/constants/enchantments";
import { EnchantmentRow } from "./enchantment-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

export function EnchantmentList() {
  const { control } = useFormContext<Item>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "enchantments",
  });

  const [selectedEnchantment, setSelectedEnchantment] = useState<string>("");

  const usedEnchantments = useMemo(
    () => new Set(fields.map((f) => (f as any).name as string)),
    [fields]
  );

  const availableEnchantments = useMemo(
    () => ENCHANTMENTS.filter((e) => !usedEnchantments.has(e)),
    [usedEnchantments]
  );

  function handleAdd() {
    if (!selectedEnchantment) return;
    append({ name: selectedEnchantment, level: 1 });
    setSelectedEnchantment("");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">
          Enchantments
          {fields.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({fields.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add enchantment controls */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              value={selectedEnchantment}
              onValueChange={setSelectedEnchantment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select enchantment..." />
              </SelectTrigger>
              <SelectContent>
                {availableEnchantments.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedEnchantment}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-6">
            <p className="text-sm text-muted-foreground">
              No enchantments added.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <EnchantmentRow
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

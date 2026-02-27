"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { Item, ItemAttribute } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import { AttributeRow } from "./attribute-row";
import { AttributeSelector } from "./attribute-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface AttributeListProps {
  balanceConfig: BalanceConfig | null;
}

export function AttributeList({ balanceConfig }: AttributeListProps) {
  const { control } = useFormContext<Item>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "attributes",
  });

  function handleAddAttribute(attr: ItemAttribute) {
    append(attr);
  }

  function handleMoveUp(index: number) {
    if (index > 0) {
      move(index, index - 1);
    }
  }

  function handleMoveDown(index: number) {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  }

  const existingNames = fields.map((f) => (f as unknown as ItemAttribute).name);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">
          Attributes
          {fields.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({fields.length})
            </span>
          )}
        </CardTitle>
        <AttributeSelector
          existingNames={existingNames}
          onSelect={handleAddAttribute}
          balanceConfig={balanceConfig}
        />
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-8">
            <p className="text-sm text-muted-foreground">
              No attributes added. Click &quot;Add Attribute&quot; to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === fields.length - 1}
                    onClick={() => handleMoveDown(index)}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <AttributeRow
                    index={index}
                    onRemove={() => remove(index)}
                    balanceConfig={balanceConfig}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

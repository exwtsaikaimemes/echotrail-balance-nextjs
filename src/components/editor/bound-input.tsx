"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import type { AttributeDef } from "@/types/balance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BoundInputProps {
  attributeIndex: number;
  boundIndex: number;
  attrDef: AttributeDef | null;
}

export function BoundInput({
  attributeIndex,
  boundIndex,
  attrDef,
}: BoundInputProps) {
  const { watch, setValue } = useFormContext<Item>();

  const bound = watch(`attributes.${attributeIndex}.bounds.${boundIndex}`);
  const boundDef = attrDef?.bounds?.[boundIndex];

  const boundType = bound?.type ?? "Double";
  const boundLabel = boundDef?.label ?? `Bound ${boundIndex + 1}`;
  const suffix = boundDef?.suffix ?? "";
  const mult = boundDef?.mult ?? 1;

  if (boundType === "String") {
    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{boundLabel}</Label>
        <Input
          type="text"
          placeholder="value"
          value={bound?.min ?? ""}
          onChange={(e) =>
            setValue(
              `attributes.${attributeIndex}.bounds.${boundIndex}.min`,
              e.target.value,
              { shouldDirty: true }
            )
          }
          className="h-8 text-sm font-mono"
        />
        {suffix && (
          <p className="text-[10px] text-muted-foreground">{suffix}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">
        {boundLabel}
        {mult !== 1 && (
          <span className="ml-1 text-[10px] opacity-60">
            (x{mult})
          </span>
        )}
        {suffix && (
          <span className="ml-1 text-[10px] opacity-60">{suffix}</span>
        )}
      </Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            step="any"
            placeholder="Min"
            value={bound?.min ?? ""}
            onChange={(e) =>
              setValue(
                `attributes.${attributeIndex}.bounds.${boundIndex}.min`,
                e.target.value,
                { shouldDirty: true }
              )
            }
            className="h-8 text-sm font-mono"
          />
        </div>
        <span className="text-xs text-muted-foreground">to</span>
        <div className="flex-1">
          <Input
            type="number"
            step="any"
            placeholder="Max"
            value={bound?.max ?? ""}
            onChange={(e) =>
              setValue(
                `attributes.${attributeIndex}.bounds.${boundIndex}.max`,
                e.target.value,
                { shouldDirty: true }
              )
            }
            className="h-8 text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import type { BalanceConfig } from "@/types/balance";
import { BoundInput } from "./bound-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeAttrCost } from "@/lib/budget";

interface AttributeRowProps {
  index: number;
  onRemove: () => void;
  balanceConfig: BalanceConfig | null;
}

export function AttributeRow({
  index,
  onRemove,
  balanceConfig,
}: AttributeRowProps) {
  const { watch, setValue } = useFormContext<Item>();

  const attribute = watch(`attributes.${index}`);
  const attrName = attribute?.name ?? "";
  const category = attribute?.category ?? "Custom";
  const bounds = attribute?.bounds ?? [];
  const bypassBP = attribute?.bypassBP ?? false;

  const attrDef = balanceConfig?.attributeDefs?.[attrName];
  const weight = balanceConfig?.weights?.[attrName] ?? 0;

  const cost = useMemo(() => {
    if (bypassBP || !balanceConfig) return 0;

    const formula = balanceConfig.formula;
    const formulaExpression = /[+\-*/^]/.test(formula) ? formula : "weight * max";

    let totalCost = 0;
    for (const b of bounds) {
      if (b.type === "String") {
        totalCost += weight;
        continue;
      }
      const minVal = parseFloat(b.min) || 0;
      const maxVal = parseFloat(b.max) || 0;
      totalCost += computeAttrCost(formulaExpression, weight, minVal, maxVal);
    }

    return Math.round(totalCost * 100) / 100;
  }, [bounds, weight, bypassBP, balanceConfig]);

  return (
    <div className="rounded-lg border p-3 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={category === "Custom" ? "default" : "secondary"}
            className={cn(
              "text-xs",
              category === "Custom"
                ? "bg-purple-600/20 text-purple-400 border-purple-600/30"
                : "bg-blue-600/20 text-blue-400 border-blue-600/30"
            )}
          >
            {category}
          </Badge>
          <span className="font-mono text-sm font-medium">{attrName}</span>
        </div>
        <div className="flex items-center gap-3">
          {!bypassBP && balanceConfig && (
            <span
              className={cn(
                "text-xs font-mono",
                cost > 0 ? "text-yellow-400" : "text-muted-foreground"
              )}
            >
              Cost: {cost}
            </span>
          )}
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

      {/* Bypass budget toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id={`bypass-${index}`}
          checked={bypassBP}
          onCheckedChange={(checked) =>
            setValue(`attributes.${index}.bypassBP`, checked, {
              shouldDirty: true,
            })
          }
          className="scale-75"
        />
        <Label
          htmlFor={`bypass-${index}`}
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Bypass Budget
        </Label>
      </div>

      {/* Bounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bounds.map((_, boundIndex) => (
          <BoundInput
            key={boundIndex}
            attributeIndex={index}
            boundIndex={boundIndex}
            attrDef={attrDef ?? null}
          />
        ))}
      </div>
    </div>
  );
}

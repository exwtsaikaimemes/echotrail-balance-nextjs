"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(!!v)}
        className="mt-0.5"
      />
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ItemToggles() {
  const { watch, setValue } = useFormContext<Item>();

  const isTest = watch("isTest");
  const usesBaseStats = watch("usesBaseStats");
  const secretItem = watch("secretItem");
  const canDrop = watch("canDrop");
  const isOffHand = watch("isOffHand");
  const isBothHands = watch("isBothHands");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Flags</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ToggleRow
          id="isTest"
          label="Test Item"
          description="Won't appear in production drops"
          checked={isTest}
          onCheckedChange={(v) => setValue("isTest", v, { shouldDirty: true })}
        />
        <ToggleRow
          id="usesBaseStats"
          label="Uses Base Stats"
          description="Inherits stats from equipment type"
          checked={usesBaseStats}
          onCheckedChange={(v) =>
            setValue("usesBaseStats", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="canDrop"
          label="Can Drop"
          description="Can drop from dungeon bosses"
          checked={canDrop}
          onCheckedChange={(v) =>
            setValue("canDrop", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="secretItem"
          label="Secret Item"
          description="Hidden from public item list"
          checked={secretItem}
          onCheckedChange={(v) =>
            setValue("secretItem", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="isOffHand"
          label="Off Hand"
          description="Held in off-hand slot"
          checked={isOffHand}
          onCheckedChange={(v) => {
            setValue("isOffHand", v, { shouldDirty: true });
            if (v) setValue("isBothHands", false, { shouldDirty: true });
          }}
        />
        <ToggleRow
          id="isBothHands"
          label="Both Hands"
          description="Requires both hands"
          checked={isBothHands}
          onCheckedChange={(v) => {
            setValue("isBothHands", v, { shouldDirty: true });
            if (v) setValue("isOffHand", false, { shouldDirty: true });
          }}
        />
      </CardContent>
    </Card>
  );
}

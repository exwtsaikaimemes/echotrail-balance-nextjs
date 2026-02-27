"use client";

import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import { Switch } from "@/components/ui/switch";
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
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
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
      <CardContent className="space-y-3">
        <ToggleRow
          id="isTest"
          label="Test Item"
          description="Mark this item as a test/development item. It will not appear in production drops."
          checked={isTest}
          onCheckedChange={(v) => setValue("isTest", v, { shouldDirty: true })}
        />
        <ToggleRow
          id="usesBaseStats"
          label="Uses Base Stats"
          description="Whether this item inherits base stats from its equipment type."
          checked={usesBaseStats}
          onCheckedChange={(v) =>
            setValue("usesBaseStats", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="canDrop"
          label="Can Drop"
          description="Whether this item can drop as a reward from dungeon bosses."
          checked={canDrop}
          onCheckedChange={(v) =>
            setValue("canDrop", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="secretItem"
          label="Secret Item"
          description="Hidden from the public item list. Only discoverable in-game."
          checked={secretItem}
          onCheckedChange={(v) =>
            setValue("secretItem", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="isOffHand"
          label="Off Hand"
          description="This item is held in the off-hand slot."
          checked={isOffHand}
          onCheckedChange={(v) =>
            setValue("isOffHand", v, { shouldDirty: true })
          }
        />
        <ToggleRow
          id="isBothHands"
          label="Both Hands"
          description="This item requires both hands (prevents off-hand items)."
          checked={isBothHands}
          onCheckedChange={(v) =>
            setValue("isBothHands", v, { shouldDirty: true })
          }
        />
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RARITY_COLORS } from "@/constants/rarities";
import { getEquipClass } from "@/constants/equipment";
import type { Item, ItemAttribute } from "@/types/item";
import type { AttributeDef } from "@/types/balance";

interface AttributeGroupItemRowProps {
  item: Item;
  attribute: ItemAttribute;
  def: AttributeDef | undefined;
}

function formatBounds(attribute: ItemAttribute, def: AttributeDef | undefined): string {
  return attribute.bounds
    .map((b, i) => {
      const boundDef = def?.bounds[i];
      if (b.type === "String") {
        return `${b.min}`;
      }
      const suffix = boundDef?.suffix ?? "";
      if (b.min === b.max) {
        return `${b.min}${suffix}`;
      }
      return `${b.min}-${b.max}${suffix}`;
    })
    .join(" \u00B7 ");
}

export function AttributeGroupItemRow({ item, attribute, def }: AttributeGroupItemRowProps) {
  const router = useRouter();
  const equipClass = getEquipClass(item.equipment);

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => router.push(`/items/${item.itemKey}`)}
    >
      <TableCell className="font-medium">
        {item.customName || item.itemKey}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="border-transparent font-semibold text-xs"
          style={{
            color: RARITY_COLORS[item.rarity] ?? "#888",
            backgroundColor: `${RARITY_COLORS[item.rarity] ?? "#888"}18`,
          }}
        >
          {item.rarity}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">{equipClass}</span>
        <span className="text-xs text-muted-foreground ml-1">
          {item.equipment.split(".")[1]}
        </span>
      </TableCell>
      <TableCell>
        <code className="text-xs font-mono text-muted-foreground">
          {formatBounds(attribute, def)}
        </code>
      </TableCell>
      <TableCell>
        {attribute.bypassBP && (
          <span className="text-xs text-muted-foreground">(bypass)</span>
        )}
      </TableCell>
    </TableRow>
  );
}

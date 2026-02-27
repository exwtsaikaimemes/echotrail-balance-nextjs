"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { Item } from "@/types/item";
import {
  RARITY_COLORS,
  RARITY_GLYPHS,
  RARITY_MC_COLORS,
} from "@/constants/rarities";
import { getEquipClass, EQUIP_SLOT_LORE } from "@/constants/equipment";
import { ATTRIBUTE_LORE_TEMPLATES, getEnchantmentLore } from "@/constants/lore-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LoreLine {
  text: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
}

function buildTooltipLines(item: Item): LoreLine[] {
  const lines: LoreLine[] = [];
  const rarityColor = RARITY_MC_COLORS[item.rarity] ?? "#aaaaaa";
  const glyph = RARITY_GLYPHS[item.rarity] ?? "";

  // Item name
  lines.push({
    text: item.customName || "Unnamed Item",
    color: RARITY_COLORS[item.rarity] ?? "#ffffff",
    bold: true,
  });

  // Blank line
  lines.push({ text: "", color: "#555555" });

  // Equipment slot line
  const equipClass = getEquipClass(item.equipment);
  const slotLore = EQUIP_SLOT_LORE[equipClass];
  if (slotLore) {
    lines.push({ text: slotLore, color: "#555555" });
  }

  // Attributes
  for (const attr of item.attributes ?? []) {
    const template = ATTRIBUTE_LORE_TEMPLATES[attr.name];
    if (template) {
      const values = (attr.bounds ?? []).map((b) => {
        if (b.type === "String") return 0;
        const maxVal = parseFloat(b.max) || 0;
        return maxVal;
      });
      try {
        const text = template(values);
        const isVanilla = attr.category === "Vanilla";
        lines.push({
          text,
          color: isVanilla ? "#3333ff" : "#5555ff",
        });
      } catch {
        lines.push({
          text: attr.name,
          color: "#5555ff",
        });
      }
    } else {
      lines.push({
        text: attr.name.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        color: "#5555ff",
      });
    }
  }

  // Enchantments
  if (item.enchantments && item.enchantments.length > 0) {
    for (const ench of item.enchantments) {
      const extra = getEnchantmentLore(ench.name, ench.level);
      const displayName = ench.name
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      lines.push({
        text: `${displayName} ${toRoman(ench.level)}`,
        color: "#aaaaaa",
      });
      if (extra) {
        lines.push({
          text: ` ${extra}`,
          color: "#3333bb",
          italic: true,
        });
      }
    }
  }

  // Blank line before rarity
  lines.push({ text: "", color: "#555555" });

  // Rarity line with glyph
  const rarityDisplay = item.rarity.charAt(0) + item.rarity.slice(1).toLowerCase();
  lines.push({
    text: `${glyph} ${rarityDisplay}`,
    color: rarityColor,
    bold: true,
  });

  // Test item warning
  if (item.isTest) {
    lines.push({
      text: "TEST ITEM",
      color: "#ff5555",
      bold: true,
      italic: true,
    });
  }

  return lines;
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let remaining = num;
  for (const [value, symbol] of map) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export function TooltipPreview() {
  const { watch } = useFormContext<Item>();
  const watchedItem = watch();

  const lines = useMemo(() => buildTooltipLines(watchedItem), [watchedItem]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Tooltip Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="mc-tooltip min-w-[250px]">
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.color,
                  fontWeight: line.bold ? "bold" : "normal",
                  fontStyle: line.italic ? "italic" : "normal",
                  minHeight: line.text ? undefined : "0.7em",
                }}
              >
                {line.text || "\u00A0"}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

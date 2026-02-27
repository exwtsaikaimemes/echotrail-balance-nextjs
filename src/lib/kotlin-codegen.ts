import type { Item } from "@/types/item";
import { EQUIPMENT_IMPORTS } from "@/constants/equipment";

/**
 * Format a numeric value so it always has a decimal point.
 * e.g. "1" -> "1.0", "3.5" -> "3.5", "" -> "0.0"
 */
function formatDouble(val: string): string {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.0";
  const s = num.toString();
  return s.includes(".") ? s : s + ".0";
}

/**
 * Generate plain-text Kotlin source code for a CustomItemType object
 * from an Item definition.
 */
export function generateKotlinCode(item: Item): string {
  const imports = new Set<string>();
  imports.add("com.echotrail.core.component.item.custom_item.CustomItemType");
  imports.add("com.echotrail.core.component.item.custom_item.data.CustomItemRarity");
  imports.add("com.echotrail.core.util.PluginUtil");

  const equipClass = (item.equipment || "").split(".")[0];
  if (EQUIPMENT_IMPORTS[equipClass]) {
    imports.add(EQUIPMENT_IMPORTS[equipClass]);
  }

  let hasCustom = false;
  let hasVanilla = false;
  let hasDouble = false;
  let hasInt = false;
  let hasString = false;

  if (item.attributes && item.attributes.length > 0) {
    imports.add("com.echotrail.core.component.item.attribute.RollableCustomAttribute");
    for (const attr of item.attributes) {
      if (attr.category === "Custom") hasCustom = true;
      else hasVanilla = true;
      for (const b of attr.bounds || []) {
        if (b.type === "Double") hasDouble = true;
        if (b.type === "Int") hasInt = true;
        if (b.type === "String") hasString = true;
      }
    }
  }
  if (hasCustom) imports.add("com.echotrail.core.component.item.attribute.CustomAttributeTypes");
  if (hasVanilla) imports.add("com.echotrail.core.component.item.attribute.VanillaAttributeTypes");
  if (hasDouble) imports.add("com.echotrail.core.component.item.attribute.bounds.DoubleBounds");
  if (hasInt) imports.add("com.echotrail.core.component.item.attribute.bounds.IntBounds");
  if (hasString) imports.add("com.echotrail.core.component.item.attribute.bounds.StringBounds");
  if (item.enchantments && item.enchantments.length > 0) {
    imports.add("org.bukkit.enchantments.Enchantment");
  }

  let code = `package com.echotrail.core.component.item.custom_item.types\n\n`;

  const sortedImports = Array.from(imports).sort();
  for (const imp of sortedImports) {
    code += `import ${imp}\n`;
  }
  code += "\n";

  code += `object ${item.objectName} : CustomItemType {\n`;
  code += `    override val key = PluginUtil.createNamespacedKey("${item.itemKey}")\n`;
  code += `    override val customName = "${item.customName}"\n`;
  code += `    override val equipment = ${item.equipment}\n`;
  code += `    override val usesEquipmentBaseStats = ${item.usesBaseStats}\n`;

  if (item.attributes && item.attributes.length > 0) {
    code += `    override val attributes = listOf(\n`;
    for (let i = 0; i < item.attributes.length; i++) {
      const attr = item.attributes[i];
      const typesClass =
        attr.category === "Custom" ? "CustomAttributeTypes" : "VanillaAttributeTypes";
      const boundsStr = (attr.bounds || [])
        .map((b) => {
          if (b.type === "Double") {
            return `DoubleBounds(${formatDouble(b.min)}, ${formatDouble(b.max)})`;
          }
          if (b.type === "Int") {
            return `IntBounds(${parseInt(b.min) || 0}, ${parseInt(b.max) || 0})`;
          }
          // String bounds: comma-separated values
          const vals = b.min
            .split(",")
            .map((v) => `"${v.trim()}"`)
            .join(", ");
          return `StringBounds(${vals})`;
        })
        .join(", ");
      const comma = i < item.attributes.length - 1 ? "," : ",";
      code += `        RollableCustomAttribute(${typesClass}.${attr.name}, ${boundsStr})${comma}\n`;
    }
    code += `    )\n`;
  } else {
    code += `    override val attributes = listOf()\n`;
  }

  code += `    override val rarity = CustomItemRarity.${item.rarity}\n`;

  if (item.customModelData) {
    code += `    override val customModelData = ${item.customModelData}\n`;
  }
  if (item.secretItem) {
    code += `    override val secretItem = true\n`;
  }
  if (!item.canDrop) {
    code += `    override val canDrop = false\n`;
  }
  if (item.isOffHand) {
    code += `    override val isOffHand = true\n`;
  }
  if (item.isBothHands) {
    code += `    override val isBothHands = true\n`;
  }
  if (item.isTest) {
    code += `    // TEST ITEM -- not for production\n`;
  }
  if (item.equippableAssetId) {
    code += `    override val equippableAssetId = "${item.equippableAssetId}"\n`;
  }

  if (item.enchantments && item.enchantments.length > 0) {
    code += `    override val enchantments = mapOf(\n`;
    for (let i = 0; i < item.enchantments.length; i++) {
      const e = item.enchantments[i];
      const comma = i < item.enchantments.length - 1 ? "," : "";
      code += `        Enchantment.${e.name} to ${e.level}${comma}\n`;
    }
    code += `    )\n`;
  }

  code += `}`;
  return code;
}

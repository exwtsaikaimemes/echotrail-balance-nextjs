import type { Item, ItemAttribute, ItemBound, ItemEnchantment } from "@/types/item";
import { RARITIES } from "@/constants/rarities";
import { EQUIP_SLOT_MAP, getEquipClass } from "@/constants/equipment";

/**
 * A parsed item from CSV. Same shape as Item but without the fields that are
 * generated on the server side (id, createdAt, modifiedAt, createdBy, modifiedBy).
 */
export interface ParsedItem {
  itemKey: string;
  objectName: string;
  customName: string;
  equipment: string;
  rarity: string;
  usesBaseStats: boolean;
  secretItem: boolean;
  canDrop: boolean;
  isOffHand: boolean;
  isBothHands: boolean;
  isTest: boolean;
  customModelData: string;
  equippableAssetId: string;
  enchantments: ItemEnchantment[];
  attributes: ItemAttribute[];
  source: string;
}

// ── CSV Helpers ──

/**
 * Escape a value for CSV output. Wraps in double-quotes if the value
 * contains a comma, double-quote, or newline.
 */
function csvEscape(val: string | number | boolean): string {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ── Public API ──

/**
 * Parse a single CSV row, handling quoted fields and escaped double-quotes.
 */
export function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (inQuotes) {
      if (c === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        current += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        fields.push(current);
        current = "";
      } else {
        current += c;
      }
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Parse a full CSV file (with header row) into an array of ParsedItem objects.
 *
 * CSV column layout (30 columns):
 *   0  item_key
 *   1  item_name
 *   2  object_name
 *   3  rarity
 *   4  rarity_tier
 *   5  equipment
 *   6  slot
 *   7  uses_base_stats
 *   8  secret
 *   9  can_drop
 *  10  is_off_hand
 *  11  is_both_hands
 *  12  custom_model_data
 *  13  equippable_asset_id
 *  14  enchantments
 *  15  attribute_name
 *  16  attribute_category
 *  17-19  bound_1_type, bound_1_min, bound_1_max
 *  20-22  bound_2_type, bound_2_min, bound_2_max
 *  23-25  bound_3_type, bound_3_min, bound_3_max
 *  26-28  bound_4_type, bound_4_min, bound_4_max
 *  29  source_file
 *
 * Items with multiple attributes produce multiple rows grouped by item_key.
 */
export function parseCSVFile(text: string): ParsedItem[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rows = lines.slice(1).map((l) => parseCSVRow(l));
  const grouped: Record<string, ParsedItem> = {};

  for (const fields of rows) {
    if (fields.length < 20) continue;

    const key = fields[0];
    if (!grouped[key]) {
      grouped[key] = {
        itemKey: fields[0],
        customName: fields[1],
        objectName: fields[2],
        rarity: fields[3],
        equipment: fields[5],
        usesBaseStats: fields[7] === "true",
        secretItem: fields[8] === "true",
        canDrop: fields[9] !== "false",
        isOffHand: fields[10] === "true",
        isBothHands: fields[11] === "true",
        isTest: false,
        customModelData: fields[12] || "",
        equippableAssetId: fields[13] || "",
        enchantments: [],
        attributes: [],
        source: "csv",
      };

      // Parse semicolon-delimited enchantments: "SHARPNESS:5; MENDING:1"
      const enchStr = fields[14];
      if (enchStr) {
        for (const part of enchStr.split(";")) {
          const [name, level] = part.trim().split(":");
          if (name && name.trim()) {
            grouped[key].enchantments.push({
              name: name.trim(),
              level: parseInt(level) || 1,
            });
          }
        }
      }
    }

    // Each row may carry one attribute (items with N attributes get N rows)
    const attrName = fields[15];
    const attrCategory = fields[16] as "Custom" | "Vanilla";
    if (attrName) {
      const bounds: ItemBound[] = [];
      for (let i = 0; i < 4; i++) {
        const bType = fields[17 + i * 3] as ItemBound["type"];
        const bMin = fields[18 + i * 3];
        const bMax = fields[19 + i * 3];
        if (bType) {
          bounds.push({ type: bType, min: bMin || "0", max: bMax || "0" });
        }
      }
      grouped[key].attributes.push({
        category: attrCategory,
        name: attrName,
        bounds,
        bypassBP: false,
      });
    }
  }

  return Object.values(grouped);
}

/**
 * Export an array of Items to CSV format.
 *
 * One row per attribute. Items with no attributes get one row with empty
 * attribute columns. The last column (source_file) is always empty on export.
 */
export function exportCSV(items: Item[]): string {
  const header =
    "item_key,item_name,object_name,rarity,rarity_tier,equipment,slot," +
    "uses_base_stats,secret,can_drop,is_off_hand,is_both_hands," +
    "custom_model_data,equippable_asset_id,enchantments," +
    "attribute_name,attribute_category," +
    "bound_1_type,bound_1_min,bound_1_max," +
    "bound_2_type,bound_2_min,bound_2_max," +
    "bound_3_type,bound_3_min,bound_3_max," +
    "bound_4_type,bound_4_min,bound_4_max," +
    "source_file";

  const lines: string[] = [header];

  for (const item of items) {
    const rarityObj = RARITIES.find((r) => r.name === item.rarity);
    const tier = rarityObj ? rarityObj.tier : 1;
    const equipClass = getEquipClass(item.equipment);
    const slot = EQUIP_SLOT_MAP[equipClass] || "HAND";
    const enchStr = (item.enchantments || [])
      .map((e) => `${e.name}:${e.level}`)
      .join("; ");

    const attrs: (ItemAttribute | null)[] =
      item.attributes && item.attributes.length > 0
        ? item.attributes
        : [null];

    for (const attr of attrs) {
      const fields: string[] = [
        csvEscape(item.itemKey),
        csvEscape(item.customName),
        csvEscape(item.objectName),
        item.rarity,
        String(tier),
        item.equipment,
        slot,
        String(item.usesBaseStats),
        String(item.secretItem),
        String(item.canDrop),
        String(item.isOffHand),
        String(item.isBothHands),
        item.customModelData || "",
        item.equippableAssetId || "",
        csvEscape(enchStr),
      ];

      if (attr) {
        fields.push(attr.name, attr.category);
        for (let i = 0; i < 4; i++) {
          if (attr.bounds && attr.bounds[i]) {
            fields.push(
              attr.bounds[i].type,
              attr.bounds[i].min,
              attr.bounds[i].max,
            );
          } else {
            fields.push("", "", "");
          }
        }
      } else {
        // 14 empty columns: name, category, 4 * (type, min, max)
        fields.push("", "", "", "", "", "", "", "", "", "", "", "", "", "");
      }

      // source_file column (always empty on export)
      fields.push("");

      lines.push(fields.join(","));
    }
  }

  return lines.join("\n");
}

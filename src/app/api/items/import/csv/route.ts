import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { dbRowToItem, itemToDbParams } from "@/lib/db-mappers";
import type { DbItemParams } from "@/lib/db-mappers";
import { broadcast } from "@/lib/ws-broadcast";

// ── CSV Parser (server-side port of the HTML's parseCSVFile) ──

function parseCSVRow(row: string): string[] {
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

interface ParsedItem {
  id: string;
  itemKey: string;
  customName: string;
  objectName: string;
  rarity: string;
  equipment: string;
  usesBaseStats: boolean;
  secretItem: boolean;
  canDrop: boolean;
  isOffHand: boolean;
  isBothHands: boolean;
  customModelData: string;
  equippableAssetId: string;
  enchantments: Array<{ name: string; level: number }>;
  attributes: Array<{
    category: string;
    name: string;
    bounds: Array<{ type: string; min: string; max: string }>;
    bypassBP: boolean;
  }>;
  source: string;
}

function parseCSVFile(text: string): ParsedItem[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rows = lines.slice(1).map((l) => parseCSVRow(l));
  const grouped: Record<string, ParsedItem> = {};

  rows.forEach((fields) => {
    if (fields.length < 20) return;
    const key = fields[0];
    if (!grouped[key]) {
      grouped[key] = {
        id: uuidv4(),
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
        customModelData: fields[12] || "",
        equippableAssetId: fields[13] || "",
        enchantments: [],
        attributes: [],
        source: "csv",
      };
      const enchStr = fields[14];
      if (enchStr) {
        enchStr.split(";").forEach((part) => {
          const [name, level] = part.trim().split(":");
          if (name && name.trim()) {
            grouped[key].enchantments.push({
              name: name.trim(),
              level: parseInt(level) || 1,
            });
          }
        });
      }
    }
    const attrName = fields[15];
    const attrCategory = fields[16];
    if (attrName) {
      const bounds: Array<{ type: string; min: string; max: string }> = [];
      for (let i = 0; i < 4; i++) {
        const bType = fields[17 + i * 3];
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
  });

  return Object.values(grouped);
}

// ── Helper: build upsert params array from DbItemParams ──

function buildUpsertParams(params: DbItemParams): any[] {
  return [
    params.id,
    params.item_key,
    params.object_name,
    params.custom_name,
    params.equipment,
    params.rarity,
    params.uses_base_stats,
    params.secret_item,
    params.can_drop,
    params.is_off_hand,
    params.is_both_hands,
    params.is_test,
    params.custom_model_data,
    params.equippable_asset_id,
    params.enchantments,
    params.attributes,
    params.source,
    params.modified_by,
    params.modified_by,
  ];
}

const UPSERT_SQL = `
  INSERT INTO echotrail_itemmanager_items
    (id, item_key, object_name, custom_name, equipment, rarity,
     uses_base_stats, secret_item, can_drop, is_off_hand, is_both_hands, is_test,
     custom_model_data, equippable_asset_id, enchantments, attributes,
     source, created_by, modified_by, created_at, modified_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  ON DUPLICATE KEY UPDATE
    object_name = VALUES(object_name), custom_name = VALUES(custom_name),
    equipment = VALUES(equipment), rarity = VALUES(rarity),
    uses_base_stats = VALUES(uses_base_stats), secret_item = VALUES(secret_item),
    can_drop = VALUES(can_drop), is_off_hand = VALUES(is_off_hand),
    is_both_hands = VALUES(is_both_hands), is_test = VALUES(is_test),
    custom_model_data = VALUES(custom_model_data),
    equippable_asset_id = VALUES(equippable_asset_id), enchantments = VALUES(enchantments),
    attributes = VALUES(attributes), source = VALUES(source),
    modified_by = VALUES(modified_by), modified_at = NOW()
`;

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const parsed = parseCSVFile(text);

    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "No items found in CSV" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const item of parsed) {
        const params = itemToDbParams(item as any, session!.user.username);
        await conn.execute(UPSERT_SQL, buildUpsertParams(params));
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [allRows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_items ORDER BY custom_name"
    ) as any;
    const allItems = allRows.map(dbRowToItem);

    broadcast(
      { type: "items:synced", items: allItems, by: session!.user.username },
      request.headers.get("x-socket-id") ?? undefined
    );

    return NextResponse.json({ items: allItems, count: parsed.length });
  } catch (err: any) {
    console.error("CSV import error:", err);
    return NextResponse.json(
      { error: "Import failed: " + err.message },
      { status: 500 }
    );
  }
}

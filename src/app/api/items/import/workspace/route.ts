import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { dbRowToItem, itemToDbParams } from "@/lib/db-mappers";
import type { DbItemParams } from "@/lib/db-mappers";
import { broadcast } from "@/lib/ws-broadcast";

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

// ── Helper: safely parse a JSON column that may already be an object ──

function parseJSON<T>(val: unknown): T {
  if (typeof val === "object" && val !== null) return val as T;
  try {
    return JSON.parse((val as string) || "{}");
  } catch {
    return {} as T;
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const data = await request.json();

    if (!data.items && !data.balanceConfig) {
      return NextResponse.json(
        { error: "No items or balance config in request" },
        { status: 400 }
      );
    }

    // ── Upsert items in a transaction ──
    if (data.items && Array.isArray(data.items)) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        for (const item of data.items) {
          if (!item.id) item.id = uuidv4();
          const params = itemToDbParams(item, session!.user.username);
          await conn.execute(UPSERT_SQL, buildUpsertParams(params));
        }
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    // ── Merge balance config ──
    if (data.balanceConfig) {
      const [currentRows] = await pool.execute(
        "SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1"
      ) as any;
      const current = currentRows[0];

      const cfg = {
        formula: data.balanceConfig.formula || current.formula,
        weights: {
          ...parseJSON<Record<string, number>>(current.weights),
          ...(data.balanceConfig.weights || {}),
        },
        allowances: parseJSON<Record<string, Record<string, number>>>(current.allowances),
        attr_defs: parseJSON<Record<string, any>>(current.attr_defs),
      };

      if (data.balanceConfig.allowances) {
        Object.keys(data.balanceConfig.allowances).forEach((r: string) => {
          if (!cfg.allowances[r]) cfg.allowances[r] = {};
          Object.assign(cfg.allowances[r], data.balanceConfig.allowances[r]);
        });
      }

      if (data.balanceConfig.attributeDefs) {
        Object.keys(data.balanceConfig.attributeDefs).forEach((name: string) => {
          if (cfg.attr_defs[name]) {
            cfg.attr_defs[name] = {
              ...cfg.attr_defs[name],
              ...data.balanceConfig.attributeDefs[name],
            };
            if (
              data.balanceConfig.attributeDefs[name].bounds &&
              cfg.attr_defs[name].bounds
            ) {
              cfg.attr_defs[name].bounds = cfg.attr_defs[name].bounds.map(
                (db_b: any, i: number) => {
                  const sb = data.balanceConfig.attributeDefs[name].bounds[i];
                  return sb ? { ...db_b, ...sb } : db_b;
                }
              );
            }
          }
        });
      }

      await pool.execute(
        `UPDATE echotrail_itemmanager_balance_config SET
          formula = ?, weights = ?, allowances = ?, attr_defs = ?,
          modified_by = ?, modified_at = NOW()
         WHERE id = 1`,
        [
          cfg.formula,
          JSON.stringify(cfg.weights),
          JSON.stringify(cfg.allowances),
          JSON.stringify(cfg.attr_defs),
          session!.user.username,
        ]
      );

      broadcast(
        {
          type: "balance:updated",
          balanceConfig: {
            formula: cfg.formula,
            weights: cfg.weights,
            allowances: cfg.allowances,
            attributeDefs: cfg.attr_defs,
          },
          by: session!.user.username,
        },
        session!.user.id
      );
    }

    // ── Return all items + current balance config ──
    const [allRows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_items ORDER BY custom_name"
    ) as any;
    const allItems = allRows.map(dbRowToItem);

    broadcast(
      { type: "items:synced", items: allItems, by: session!.user.username },
      session!.user.id
    );

    const [balRows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1"
    ) as any;
    const balRow = balRows[0];

    return NextResponse.json({
      items: allItems,
      balanceConfig: {
        formula: balRow.formula,
        weights: parseJSON<Record<string, number>>(balRow.weights),
        allowances: parseJSON<Record<string, Record<string, number>>>(balRow.allowances),
        attributeDefs: parseJSON<Record<string, any>>(balRow.attr_defs),
      },
    });
  } catch (err: any) {
    console.error("Workspace import error:", err);
    return NextResponse.json(
      { error: "Import failed: " + err.message },
      { status: 500 }
    );
  }
}

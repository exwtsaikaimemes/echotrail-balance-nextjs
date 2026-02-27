import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { dbRowToItem, itemToDbParams, recordHistory } from "@/lib/db-mappers";
import { computeBudgetUsedFromDB } from "@/lib/budget-server";
import { itemSchema } from "@/lib/validators";
import { broadcast, broadcastToAll } from "@/lib/ws-broadcast";

export async function GET() {
  const { error, session: _session } = await requireAuth();
  if (error) return error;

  const [rows] = await pool.execute(
    "SELECT * FROM echotrail_itemmanager_items ORDER BY custom_name"
  ) as any;

  return NextResponse.json({ items: rows.map(dbRowToItem) });
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = itemSchema.safeParse(body.item);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const item = parsed.data;
    const id = uuidv4();
    const params = itemToDbParams({ ...item, id } as any, session!.user.username);

    await pool.execute(
      `INSERT INTO echotrail_itemmanager_items
        (id, item_key, object_name, custom_name, equipment, rarity,
         uses_base_stats, secret_item, can_drop, is_off_hand, is_both_hands, is_test,
         custom_model_data, equippable_asset_id, enchantments, attributes,
         source, created_by, modified_by, created_at, modified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        params.id, params.item_key, params.object_name, params.custom_name,
        params.equipment, params.rarity,
        params.uses_base_stats, params.secret_item, params.can_drop,
        params.is_off_hand, params.is_both_hands, params.is_test,
        params.custom_model_data, params.equippable_asset_id,
        params.enchantments, params.attributes,
        params.source, params.modified_by, params.modified_by,
      ]
    );

    const [created] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_items WHERE id = ?",
      [id]
    ) as any;
    const createdItem = dbRowToItem(created[0]);

    const budgetAfter = await computeBudgetUsedFromDB(createdItem);
    await recordHistory(
      id,
      createdItem.itemKey,
      createdItem.customName,
      "created",
      session!.user.username,
      null,
      createdItem,
      null,
      budgetAfter
    );

    broadcast(
      { type: "item:created", item: createdItem, by: session!.user.username },
      session!.user.id
    );
    broadcastToAll({
      type: "history:new",
      entry: {
        itemId: id,
        itemKey: createdItem.itemKey,
        itemName: createdItem.customName,
        changeType: "created",
        changedBy: session!.user.username,
        budgetBefore: null,
        budgetAfter,
      },
      by: session!.user.username,
    });

    return NextResponse.json({ item: createdItem }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "An item with this key already exists" },
        { status: 409 }
      );
    }
    console.error("Create item error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const { error, session } = await requireAuth();
  if (error) return error;

  await pool.execute("DELETE FROM echotrail_itemmanager_items");

  broadcast(
    { type: "items:cleared", by: session!.user.username },
    session!.user.id
  );

  return new NextResponse(null, { status: 204 });
}

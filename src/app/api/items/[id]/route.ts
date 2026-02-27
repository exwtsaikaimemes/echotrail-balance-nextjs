import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { dbRowToItem, itemToDbParams, recordHistory } from "@/lib/db-mappers";
import { computeBudgetUsedFromDB } from "@/lib/budget-server";
import { broadcast, broadcastToAll } from "@/lib/ws-broadcast";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error, session: _session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const [rows] = await pool.execute(
    "SELECT * FROM echotrail_itemmanager_items WHERE id = ?",
    [id]
  ) as any;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ item: dbRowToItem(rows[0]) });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const item = body.item;
    if (!item) {
      return NextResponse.json(
        { error: "Item data required" },
        { status: 400 }
      );
    }

    // Fetch the existing item (before snapshot)
    const [existing] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_items WHERE id = ?",
      [id]
    ) as any;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const beforeItem = dbRowToItem(existing[0]);
    const budgetBefore = await computeBudgetUsedFromDB(beforeItem);

    const dbParams = itemToDbParams({ ...item, id }, session!.user.username);

    await pool.execute(
      `UPDATE echotrail_itemmanager_items SET
        item_key = ?, object_name = ?, custom_name = ?,
        equipment = ?, rarity = ?,
        uses_base_stats = ?, secret_item = ?,
        can_drop = ?, is_off_hand = ?, is_both_hands = ?, is_test = ?,
        custom_model_data = ?, equippable_asset_id = ?,
        enchantments = ?, attributes = ?,
        source = ?, modified_by = ?, modified_at = NOW()
       WHERE id = ?`,
      [
        dbParams.item_key, dbParams.object_name, dbParams.custom_name,
        dbParams.equipment, dbParams.rarity,
        dbParams.uses_base_stats, dbParams.secret_item,
        dbParams.can_drop, dbParams.is_off_hand, dbParams.is_both_hands, dbParams.is_test,
        dbParams.custom_model_data, dbParams.equippable_asset_id,
        dbParams.enchantments, dbParams.attributes,
        dbParams.source, dbParams.modified_by,
        id,
      ]
    );

    // Fetch the updated item (after snapshot)
    const [updated] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_items WHERE id = ?",
      [id]
    ) as any;
    const updatedItem = dbRowToItem(updated[0]);

    // Record history
    const budgetAfter = await computeBudgetUsedFromDB(updatedItem);
    await recordHistory(
      id,
      updatedItem.itemKey,
      updatedItem.customName,
      "updated",
      session!.user.username,
      beforeItem,
      updatedItem,
      budgetBefore,
      budgetAfter
    );

    broadcast(
      { type: "item:updated", item: updatedItem, by: session!.user.username },
      session!.user.id
    );
    broadcastToAll({
      type: "history:new",
      entry: {
        itemId: id,
        itemKey: updatedItem.itemKey,
        itemName: updatedItem.customName,
        changeType: "updated",
        changedBy: session!.user.username,
        budgetBefore,
        budgetAfter,
      },
      by: session!.user.username,
    });

    return NextResponse.json({ item: updatedItem });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "An item with this key already exists" },
        { status: 409 }
      );
    }
    console.error("Update item error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const [existing] = await pool.execute(
    "SELECT * FROM echotrail_itemmanager_items WHERE id = ?",
    [id]
  ) as any;

  if (existing.length === 0) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const beforeItem = dbRowToItem(existing[0]);
  const budgetBefore = await computeBudgetUsedFromDB(beforeItem);

  await pool.execute(
    "DELETE FROM echotrail_itemmanager_items WHERE id = ?",
    [id]
  );

  // Record history
  await recordHistory(
    id,
    beforeItem.itemKey,
    beforeItem.customName,
    "deleted",
    session!.user.username,
    beforeItem,
    null,
    budgetBefore,
    null
  );

  broadcast(
    { type: "item:deleted", itemId: id, by: session!.user.username },
    session!.user.id
  );
  broadcastToAll({
    type: "history:new",
    entry: {
      itemId: id,
      itemKey: beforeItem.itemKey,
      itemName: beforeItem.customName,
      changeType: "deleted",
      changedBy: session!.user.username,
      budgetBefore,
      budgetAfter: null,
    },
    by: session!.user.username,
  });

  return new NextResponse(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";

function parseJSON(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return val;
  try { return JSON.parse(val as string); } catch { return null; }
}

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");
    const itemId = searchParams.get("item_id");

    let where = "";
    const params: string[] = [];
    if (itemId) {
      where = "WHERE item_id = ?";
      params.push(itemId);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM echotrail_itemmanager_item_history ${where}`,
      params
    ) as any;
    const total = countRows[0].total;

    const [rows] = await pool.execute(
      `SELECT * FROM echotrail_itemmanager_item_history ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, String(limit), String(offset)]
    ) as any;

    const history = rows.map((row: any) => ({
      id: row.id,
      itemId: row.item_id,
      itemKey: row.item_key,
      itemName: row.item_name,
      changeType: row.change_type,
      changedBy: row.changed_by,
      budgetBefore: row.budget_before !== null ? parseFloat(row.budget_before) : null,
      budgetAfter: row.budget_after !== null ? parseFloat(row.budget_after) : null,
      snapshotBefore: parseJSON(row.snapshot_before),
      snapshotAfter: parseJSON(row.snapshot_after),
      createdAt: row.created_at,
    }));

    return NextResponse.json({ history, total });
  } catch (err) {
    console.error("History fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

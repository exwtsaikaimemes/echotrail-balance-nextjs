import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await pool.execute(
      "UPDATE echotrail_itemmanager_item_history SET is_hidden = NOT is_hidden WHERE id = ?",
      [entryId]
    );

    const [rows] = await pool.execute(
      "SELECT is_hidden FROM echotrail_itemmanager_item_history WHERE id = ?",
      [entryId]
    ) as any;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ isHidden: !!rows[0].is_hidden });
  } catch (err) {
    console.error("Toggle visibility error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

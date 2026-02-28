import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import type { SavedLoadout } from "@/types/loadout";

function dbRowToSavedLoadout(row: any): SavedLoadout {
  return {
    id: row.id,
    name: row.name,
    slots: {
      main_hand: row.main_hand || null,
      off_hand: row.off_hand || null,
      helmet: row.helmet || null,
      chestplate: row.chestplate || null,
      leggings: row.leggings || null,
      boots: row.boots || null,
    },
    updatedAt: row.updated_at,
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;
  const { id } = await params;
  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Verify ownership
  const [ownerRows] = (await pool.execute(
    "SELECT username FROM echotrail_itemmanager_loadout_saved WHERE id = ?",
    [id]
  )) as any;

  if (ownerRows.length === 0) {
    return NextResponse.json({ error: "Loadout not found" }, { status: 404 });
  }

  if (ownerRows[0].username !== username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Update name
  await pool.execute(
    "UPDATE echotrail_itemmanager_loadout_saved SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name.trim(), id]
  );

  // Return updated loadout
  const [rows] = (await pool.execute(
    "SELECT id, name, main_hand, off_hand, helmet, chestplate, leggings, boots, updated_at FROM echotrail_itemmanager_loadout_saved WHERE id = ?",
    [id]
  )) as any;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Loadout not found" }, { status: 404 });
  }

  return NextResponse.json({ loadout: dbRowToSavedLoadout(rows[0]) });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;
  const { id } = await params;

  // Verify ownership
  const [ownerRows] = (await pool.execute(
    "SELECT username FROM echotrail_itemmanager_loadout_saved WHERE id = ?",
    [id]
  )) as any;

  if (ownerRows.length === 0) {
    return NextResponse.json({ error: "Loadout not found" }, { status: 404 });
  }

  if (ownerRows[0].username !== username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Delete
  await pool.execute("DELETE FROM echotrail_itemmanager_loadout_saved WHERE id = ?", [id]);

  return NextResponse.json({ success: true });
}

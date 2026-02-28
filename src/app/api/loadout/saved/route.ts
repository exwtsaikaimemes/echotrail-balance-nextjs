import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import type { SavedLoadout, EquippedLoadout } from "@/types/loadout";

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

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;

  const [rows] = (await pool.execute(
    "SELECT id, name, main_hand, off_hand, helmet, chestplate, leggings, boots, updated_at FROM echotrail_itemmanager_loadout_saved WHERE username = ? ORDER BY updated_at DESC",
    [username]
  )) as any;

  const loadouts = rows.map(dbRowToSavedLoadout);

  return NextResponse.json({ loadouts });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;
  const body = await req.json();
  const { name, slots } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await pool.execute(
    `INSERT INTO echotrail_itemmanager_loadout_saved
     (id, username, name, main_hand, off_hand, helmet, chestplate, leggings, boots, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      username,
      name.trim(),
      slots.main_hand || null,
      slots.off_hand || null,
      slots.helmet || null,
      slots.chestplate || null,
      slots.leggings || null,
      slots.boots || null,
      now,
      now,
    ]
  );

  const savedLoadout: SavedLoadout = {
    id,
    name: name.trim(),
    slots: {
      main_hand: slots.main_hand || null,
      off_hand: slots.off_hand || null,
      helmet: slots.helmet || null,
      chestplate: slots.chestplate || null,
      leggings: slots.leggings || null,
      boots: slots.boots || null,
    },
    updatedAt: now,
  };

  return NextResponse.json({ loadout: savedLoadout }, { status: 201 });
}

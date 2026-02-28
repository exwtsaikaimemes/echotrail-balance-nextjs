import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import type { EquippedLoadout, LoadoutSlot } from "@/types/loadout";

const LOADOUT_SLOTS: LoadoutSlot[] = ["main_hand", "off_hand", "helmet", "chestplate", "leggings", "boots"];

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;

  const [rows] = (await pool.execute(
    "SELECT main_hand, off_hand, helmet, chestplate, leggings, boots FROM echotrail_itemmanager_loadout_current WHERE username = ?",
    [username]
  )) as any;

  if (rows.length === 0) {
    // Return empty loadout
    const emptyLoadout: EquippedLoadout = {
      main_hand: null,
      off_hand: null,
      helmet: null,
      chestplate: null,
      leggings: null,
      boots: null,
    };
    return NextResponse.json({ loadout: emptyLoadout });
  }

  const row = rows[0];
  const loadout: EquippedLoadout = {
    main_hand: row.main_hand || null,
    off_hand: row.off_hand || null,
    helmet: row.helmet || null,
    chestplate: row.chestplate || null,
    leggings: row.leggings || null,
    boots: row.boots || null,
  };

  return NextResponse.json({ loadout });
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;
  const body = await req.json();
  const { slot, itemKey } = body;

  // Validate slot
  if (!LOADOUT_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  // Upsert the current loadout
  await pool.execute(
    `INSERT INTO echotrail_itemmanager_loadout_current (username, ${slot})
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE ${slot} = VALUES(${slot}), updated_at = CURRENT_TIMESTAMP`,
    [username, itemKey]
  );

  // Return updated loadout
  const [rows] = (await pool.execute(
    "SELECT main_hand, off_hand, helmet, chestplate, leggings, boots FROM echotrail_itemmanager_loadout_current WHERE username = ?",
    [username]
  )) as any;

  const row = rows[0];
  const loadout: EquippedLoadout = {
    main_hand: row.main_hand || null,
    off_hand: row.off_hand || null,
    helmet: row.helmet || null,
    chestplate: row.chestplate || null,
    leggings: row.leggings || null,
    boots: row.boots || null,
  };

  return NextResponse.json({ loadout });
}

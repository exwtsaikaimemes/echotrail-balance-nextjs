import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import type { EquippedLoadout } from "@/types/loadout";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const username = session!.user!.username;
  const { id } = await params;

  // Fetch the saved loadout
  const [rows] = (await pool.execute(
    "SELECT main_hand, off_hand, helmet, chestplate, leggings, boots FROM echotrail_itemmanager_loadout_saved WHERE id = ? AND username = ?",
    [id, username]
  )) as any;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Loadout not found" }, { status: 404 });
  }

  const savedSlots = rows[0];

  // Upsert into current loadout
  await pool.execute(
    `INSERT INTO echotrail_itemmanager_loadout_current
     (username, main_hand, off_hand, helmet, chestplate, leggings, boots)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       main_hand = VALUES(main_hand),
       off_hand = VALUES(off_hand),
       helmet = VALUES(helmet),
       chestplate = VALUES(chestplate),
       leggings = VALUES(leggings),
       boots = VALUES(boots),
       updated_at = CURRENT_TIMESTAMP`,
    [
      username,
      savedSlots.main_hand || null,
      savedSlots.off_hand || null,
      savedSlots.helmet || null,
      savedSlots.chestplate || null,
      savedSlots.leggings || null,
      savedSlots.boots || null,
    ]
  );

  // Return updated current loadout
  const [currentRows] = (await pool.execute(
    "SELECT main_hand, off_hand, helmet, chestplate, leggings, boots FROM echotrail_itemmanager_loadout_current WHERE username = ?",
    [username]
  )) as any;

  const row = currentRows[0];
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

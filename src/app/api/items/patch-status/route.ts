import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import type { PatchStatus } from "@/types/history";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    // Get the current patch version
    const [pvRows] = await pool.execute(
      "SELECT version FROM echotrail_itemmanager_patch_versions WHERE is_current = 1 LIMIT 1"
    ) as any;

    if (pvRows.length === 0) {
      return NextResponse.json({ statuses: {} });
    }

    const currentVersion = pvRows[0].version;

    // Get the last history entry per item_id for the current patch version
    const [rows] = await pool.execute(
      `SELECT h.item_id, h.change_type, h.budget_before, h.budget_after
       FROM echotrail_itemmanager_item_history h
       INNER JOIN (
         SELECT item_id, MAX(id) AS max_id
         FROM echotrail_itemmanager_item_history
         WHERE patch_version = ?
         GROUP BY item_id
       ) latest ON h.id = latest.max_id`,
      [currentVersion]
    ) as any;

    const statuses: Record<string, PatchStatus> = {};

    for (const row of rows) {
      const itemId = row.item_id;
      const changeType = row.change_type as string;

      if (changeType === "created") {
        statuses[itemId] = "new";
      } else if (changeType === "updated") {
        const before = row.budget_before !== null ? parseFloat(row.budget_before) : null;
        const after = row.budget_after !== null ? parseFloat(row.budget_after) : null;
        if (before === null || after === null) {
          statuses[itemId] = "adjusted";
        } else if (after > before) {
          statuses[itemId] = "buffed";
        } else if (after < before) {
          statuses[itemId] = "nerfed";
        } else {
          statuses[itemId] = "adjusted";
        }
      }
      // deleted items won't show in the items list, so we skip them
    }

    return NextResponse.json({ statuses });
  } catch (err) {
    console.error("Patch status fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";

function parseJSON(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return val;
  try { return JSON.parse(val as string); } catch { return null; }
}

function mapHistoryRow(row: any) {
  return {
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
    patchVersion: row.patch_version ?? null,
    isHidden: !!row.is_hidden,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get("grouped") === "true";
    const versionFilter = searchParams.get("version");
    const itemId = searchParams.get("item_id");

    // ── Grouped mode: return entries grouped by patch version ──
    if (grouped) {
      let where = "WHERE 1=1";
      const params: string[] = [];

      if (versionFilter) {
        where += " AND h.patch_version = ?";
        params.push(versionFilter);
      }
      if (itemId) {
        where += " AND h.item_id = ?";
        params.push(itemId);
      }

      const [rows] = await pool.execute(
        `SELECT h.*, pv.description AS version_description
         FROM echotrail_itemmanager_item_history h
         LEFT JOIN echotrail_itemmanager_patch_versions pv ON pv.version = h.patch_version
         ${where}
         ORDER BY h.created_at DESC`,
        params
      ) as any;

      // Group by patch_version
      const groupMap = new Map<string, { description: string | null; entries: any[] }>();
      for (const row of rows) {
        const ver = row.patch_version ?? "Unknown";
        if (!groupMap.has(ver)) {
          groupMap.set(ver, { description: row.version_description ?? null, entries: [] });
        }
        groupMap.get(ver)!.entries.push(mapHistoryRow(row));
      }

      // Sort groups: current/newest first, Pre-3.0.0 last
      const groups = Array.from(groupMap.entries()).map(([version, data]) => ({
        version,
        description: data.description,
        entries: data.entries,
      }));

      return NextResponse.json({ groups });
    }

    // ── Flat mode (original behavior) ──
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

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

    const history = rows.map(mapHistoryRow);

    return NextResponse.json({ history, total });
  } catch (err) {
    console.error("History fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

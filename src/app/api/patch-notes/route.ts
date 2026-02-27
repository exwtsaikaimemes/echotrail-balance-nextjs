import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { computeItemDiff } from "@/lib/diff-utils";
import { classifyUpdate } from "@/lib/diff-utils";
import type { Item } from "@/types/item";
import type { PublicPatchGroup, PublicPatchEntry } from "@/types/history";

function parseJSON(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return val;
  try { return JSON.parse(val as string); } catch { return null; }
}

export async function GET(request: NextRequest) {
  // No auth required — truly public

  try {
    const { searchParams } = new URL(request.url);
    const versionFilter = searchParams.get("version");

    let where = "WHERE h.is_hidden = 0";
    const params: string[] = [];

    if (versionFilter) {
      where += " AND h.patch_version = ?";
      params.push(versionFilter);
    }

    const [rows] = await pool.execute(
      `SELECT h.id, h.patch_version, h.item_id, h.item_name, h.change_type,
              h.budget_before, h.budget_after, h.snapshot_before, h.snapshot_after,
              h.created_at,
              pv.description AS version_description
       FROM echotrail_itemmanager_item_history h
       LEFT JOIN echotrail_itemmanager_patch_versions pv ON pv.version = h.patch_version
       ${where}
       ORDER BY h.created_at ASC`,
      params
    ) as any;

    // Group rows by (patch_version, item_id) for consolidation
    const versionMap = new Map<string, {
      description: string | null;
      itemMap: Map<string, any[]>;
    }>();

    for (const row of rows) {
      const ver = row.patch_version ?? "Unknown";
      if (!versionMap.has(ver)) {
        versionMap.set(ver, {
          description: row.version_description ?? null,
          itemMap: new Map(),
        });
      }
      const group = versionMap.get(ver)!;
      const itemId = row.item_id;
      if (!group.itemMap.has(itemId)) {
        group.itemMap.set(itemId, []);
      }
      group.itemMap.get(itemId)!.push(row);
    }

    // Consolidate per item per version
    const groups: PublicPatchGroup[] = [];

    for (const [version, { description, itemMap }] of versionMap) {
      const entries: PublicPatchEntry[] = [];

      for (const [, itemRows] of itemMap) {
        const first = itemRows[0];
        const last = itemRows[itemRows.length - 1];
        const firstType = first.change_type as string;
        const lastType = last.change_type as string;

        // Created then deleted → omit entirely
        if (firstType === "created" && lastType === "deleted") {
          continue;
        }

        // Updated then deleted → show as deleted
        if (lastType === "deleted" && firstType !== "created") {
          entries.push({
            itemName: last.item_name,
            changeType: "deleted",
            diff: null,
          });
          continue;
        }

        // Created (then possibly updated) → show as created with no diff
        if (firstType === "created") {
          entries.push({
            itemName: last.item_name,
            changeType: "created",
            diff: null,
          });
          continue;
        }

        // Single or multiple updates → consolidate into one entry
        const snapshotBefore = parseJSON(first.snapshot_before) as Item | null;
        const snapshotAfter = parseJSON(last.snapshot_after) as Item | null;
        const diff = (snapshotBefore || snapshotAfter)
          ? computeItemDiff(snapshotBefore, snapshotAfter)
          : null;

        const budgetBefore = first.budget_before !== null ? parseFloat(first.budget_before) : null;
        const budgetAfter = last.budget_after !== null ? parseFloat(last.budget_after) : null;
        const subtype = classifyUpdate(budgetBefore, budgetAfter);

        entries.push({
          itemName: last.item_name,
          changeType: subtype,
          diff,
        });
      }

      groups.push({ version, description, entries });
    }

    // Reverse so newest versions come first
    groups.reverse();

    return NextResponse.json({ groups });
  } catch (err) {
    console.error("Public patch notes fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const [rows] = await pool.execute(
      "SELECT item_id, COUNT(*) as count FROM echotrail_itemmanager_item_comments GROUP BY item_id"
    ) as any;

    const counts: Record<string, number> = {};
    rows.forEach((r: any) => {
      counts[r.item_id] = r.count;
    });

    return NextResponse.json({ counts });
  } catch (err) {
    console.error("Comment counts error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [[userCount]] = await pool.execute("SELECT COUNT(*) as count FROM echotrail_itemmanager_users") as any;
    const [[itemCount]] = await pool.execute("SELECT COUNT(*) as count FROM echotrail_itemmanager_items") as any;
    const [[balanceCount]] = await pool.execute("SELECT COUNT(*) as count FROM echotrail_itemmanager_balance_config") as any;

    return NextResponse.json({
      mysql: {
        connected: true,
        users: userCount.count,
        items: itemCount.count,
        balanceConfig: balanceCount.count,
      },
    });
  } catch (err) {
    console.error("Admin status error:", err);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}

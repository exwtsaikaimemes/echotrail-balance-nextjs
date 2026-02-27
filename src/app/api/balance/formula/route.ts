import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { broadcast } from "@/lib/ws-broadcast";

function parseJSON(val: unknown): Record<string, unknown> {
  if (typeof val === "object" && val !== null) return val as Record<string, unknown>;
  try { return JSON.parse(val as string); } catch { return {}; }
}

export async function PUT(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const formulaName = body.formula;
    if (!formulaName || typeof formulaName !== "string") {
      return NextResponse.json({ error: "formula name required" }, { status: 400 });
    }

    // Verify the formula name exists in the formulas table
    const [formulaRows] = await pool.execute(
      "SELECT name FROM echotrail_itemmanager_budget_formulas WHERE name = ?",
      [formulaName]
    ) as any;

    if (formulaRows.length === 0) {
      return NextResponse.json({ error: `Formula "${formulaName}" not found` }, { status: 404 });
    }

    await pool.execute(
      "UPDATE echotrail_itemmanager_balance_config SET formula = ?, modified_by = ?, modified_at = NOW() WHERE id = 1",
      [formulaName, session!.user.username]
    );

    const [updatedRows] = await pool.execute("SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1") as any;
    const row = updatedRows[0];
    const balanceConfig = {
      formula: row.formula,
      weights: parseJSON(row.weights),
      allowances: parseJSON(row.allowances),
      attributeDefs: parseJSON(row.attr_defs),
    };

    broadcast(
      { type: "balance:updated", balanceConfig: balanceConfig as any, by: session!.user.username },
      request.headers.get("x-socket-id") ?? undefined
    );

    return NextResponse.json({ balanceConfig });
  } catch (err) {
    console.error("Update formula error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

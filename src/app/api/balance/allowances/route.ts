import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { allowancesSchema } from "@/lib/validators";
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
    const parsed = allowancesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "allowances required" }, { status: 400 });
    }

    const [currentRows] = await pool.execute("SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1") as any;
    const current = currentRows[0];
    const existingAllowances = parseJSON(current.allowances) as Record<string, Record<string, number>>;

    Object.keys(parsed.data.allowances).forEach(r => {
      if (!existingAllowances[r]) existingAllowances[r] = {};
      Object.assign(existingAllowances[r], parsed.data.allowances[r]);
    });

    await pool.execute(
      "UPDATE echotrail_itemmanager_balance_config SET allowances = ?, modified_by = ?, modified_at = NOW() WHERE id = 1",
      [JSON.stringify(existingAllowances), session!.user.username]
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
      session!.user.id
    );

    return NextResponse.json({ balanceConfig });
  } catch (err) {
    console.error("Update allowances error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

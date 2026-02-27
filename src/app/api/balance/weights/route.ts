import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { weightsSchema } from "@/lib/validators";
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
    const parsed = weightsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "weights required" }, { status: 400 });
    }

    const [currentRows] = await pool.execute("SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1") as any;
    const current = currentRows[0];
    const existingWeights = parseJSON(current.weights) as Record<string, number>;
    const merged = { ...existingWeights, ...parsed.data.weights };

    await pool.execute(
      "UPDATE echotrail_itemmanager_balance_config SET weights = ?, modified_by = ?, modified_at = NOW() WHERE id = 1",
      [JSON.stringify(merged), session!.user.username]
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
    console.error("Update weights error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

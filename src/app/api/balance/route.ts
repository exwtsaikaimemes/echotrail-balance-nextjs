import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { balanceConfigSchema } from "@/lib/validators";
import { broadcast } from "@/lib/ws-broadcast";
import { resolveFormulaExpression } from "@/lib/budget-server";

function parseJSON(val: unknown): Record<string, unknown> {
  if (typeof val === "object" && val !== null) return val as Record<string, unknown>;
  try { return JSON.parse(val as string); } catch { return {}; }
}

async function getBalanceConfig() {
  const [rows] = await pool.execute("SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1") as any;
  const row = rows[0];

  const formulaExpression = await resolveFormulaExpression(row.formula);

  return {
    formula: formulaExpression,
    formulaName: row.formula,
    weights: parseJSON(row.weights),
    allowances: parseJSON(row.allowances),
    attributeDefs: parseJSON(row.attr_defs),
  };
}

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    return NextResponse.json({ balanceConfig: await getBalanceConfig() });
  } catch (err) {
    console.error("Get balance error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = balanceConfigSchema.safeParse(body.balanceConfig);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid balance config" }, { status: 400 });
    }

    const cfg = parsed.data;

    await pool.execute(
      `UPDATE echotrail_itemmanager_balance_config SET
        formula = ?, weights = ?, allowances = ?, attr_defs = ?,
        modified_by = ?, modified_at = NOW()
       WHERE id = 1`,
      [
        cfg.formula || "Flat",
        JSON.stringify(cfg.weights || {}),
        JSON.stringify(cfg.allowances || {}),
        JSON.stringify(cfg.attributeDefs || {}),
        session!.user.username,
      ]
    );

    const updated = await getBalanceConfig();
    broadcast(
      { type: "balance:updated", balanceConfig: updated as any, by: session!.user.username },
      request.headers.get("x-socket-id") ?? undefined
    );

    return NextResponse.json({ balanceConfig: updated });
  } catch (err) {
    console.error("Update balance error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

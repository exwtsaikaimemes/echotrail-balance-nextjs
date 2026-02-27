import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { validateExpression } from "@/lib/formula-eval";
import { budgetFormulaSchema } from "@/lib/validators";
import { broadcast } from "@/lib/ws-broadcast";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_budget_formulas ORDER BY created_at ASC"
    );
    return NextResponse.json({ formulas: rows });
  } catch (err) {
    console.error("Get formulas error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = budgetFormulaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid formula data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, expression, description } = parsed.data;

    // Validate expression is parseable
    const exprError = validateExpression(expression);
    if (exprError) {
      return NextResponse.json(
        { error: `Invalid expression: ${exprError}` },
        { status: 400 }
      );
    }

    const id = uuidv4();
    await pool.execute(
      "INSERT INTO echotrail_itemmanager_budget_formulas (id, name, expression, description, created_by) VALUES (?, ?, ?, ?, ?)",
      [id, name, expression, description || null, session!.user.username]
    );

    const [rows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_budget_formulas WHERE id = ?",
      [id]
    ) as any;

    broadcast(
      { type: "balance:updated", balanceConfig: {} as any, by: session!.user.username },
      request.headers.get("x-socket-id") ?? undefined
    );

    return NextResponse.json({ formula: rows[0] }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A formula with that name already exists" }, { status: 409 });
    }
    console.error("Create formula error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

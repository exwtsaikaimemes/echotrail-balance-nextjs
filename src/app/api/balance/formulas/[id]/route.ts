import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { validateExpression } from "@/lib/formula-eval";
import { budgetFormulaSchema } from "@/lib/validators";
import { broadcast } from "@/lib/ws-broadcast";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

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

    const exprError = validateExpression(expression);
    if (exprError) {
      return NextResponse.json(
        { error: `Invalid expression: ${exprError}` },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      "UPDATE echotrail_itemmanager_budget_formulas SET name = ?, expression = ?, description = ? WHERE id = ?",
      [name, expression, description || null, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }

    // If the active formula in balance_config references the old name, update it
    const [configRows] = await pool.execute(
      "SELECT formula FROM echotrail_itemmanager_balance_config WHERE id = 1"
    ) as any;
    if (configRows.length > 0) {
      // Check if the active formula references this formula's expression by looking up old name
      const [oldRows] = await pool.execute(
        "SELECT * FROM echotrail_itemmanager_budget_formulas WHERE id = ?",
        [id]
      ) as any;
      if (oldRows.length > 0 && configRows[0].formula === oldRows[0].name) {
        // The active formula was renamed — update balance_config
        await pool.execute(
          "UPDATE echotrail_itemmanager_balance_config SET formula = ? WHERE id = 1",
          [name]
        );
      }
    }

    const [rows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_budget_formulas WHERE id = ?",
      [id]
    ) as any;

    broadcast(
      { type: "balance:updated", balanceConfig: {} as any, by: session!.user.username },
      request.headers.get("x-socket-id") ?? undefined
    );

    return NextResponse.json({ formula: rows[0] });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A formula with that name already exists" }, { status: 409 });
    }
    console.error("Update formula error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    // Check if this formula is the active one
    const [formulaRows] = await pool.execute(
      "SELECT name FROM echotrail_itemmanager_budget_formulas WHERE id = ?",
      [id]
    ) as any;

    if (formulaRows.length === 0) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 });
    }

    const formulaName = formulaRows[0].name;

    const [configRows] = await pool.execute(
      "SELECT formula FROM echotrail_itemmanager_balance_config WHERE id = 1"
    ) as any;

    if (configRows.length > 0 && configRows[0].formula === formulaName) {
      return NextResponse.json(
        { error: "Cannot delete the active formula. Switch to a different formula first." },
        { status: 409 }
      );
    }

    await pool.execute(
      "DELETE FROM echotrail_itemmanager_budget_formulas WHERE id = ?",
      [id]
    );

    broadcast(
      { type: "balance:updated", balanceConfig: {} as any, by: session!.user.username },
      request.headers.get("x-socket-id") ?? undefined
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete formula error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

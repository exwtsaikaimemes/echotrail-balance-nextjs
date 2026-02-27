import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { attributeDefsSchema } from "@/lib/validators";
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
    const parsed = attributeDefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "attributeDefs required" }, { status: 400 });
    }

    const [currentRows] = await pool.execute("SELECT * FROM echotrail_itemmanager_balance_config WHERE id = 1") as any;
    const current = currentRows[0];
    const existingDefs = parseJSON(current.attr_defs) as Record<string, any>;

    Object.keys(parsed.data.attributeDefs).forEach(name => {
      const incoming = parsed.data.attributeDefs[name] as Record<string, any>;
      if (existingDefs[name]) {
        existingDefs[name] = { ...(existingDefs[name] as Record<string, any>), ...incoming };
        if (incoming.bounds && (existingDefs[name] as any).bounds) {
          (existingDefs[name] as any).bounds = (existingDefs[name] as any).bounds.map((db_b: any, i: number) => {
            const sb = incoming.bounds?.[i];
            return sb ? { ...db_b, ...sb } : db_b;
          });
        }
      }
    });

    await pool.execute(
      "UPDATE echotrail_itemmanager_balance_config SET attr_defs = ?, modified_by = ?, modified_at = NOW() WHERE id = 1",
      [JSON.stringify(existingDefs), session!.user.username]
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
    console.error("Update defs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

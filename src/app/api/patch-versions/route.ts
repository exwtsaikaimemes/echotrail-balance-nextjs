import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_patch_versions ORDER BY created_at DESC"
    ) as any;

    const versions = rows.map((row: any) => ({
      id: row.id,
      version: row.version,
      description: row.description ?? null,
      isCurrent: !!row.is_current,
      createdBy: row.created_by,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ versions });
  } catch (err) {
    console.error("Patch versions fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { version, description } = body;

    if (!version || typeof version !== "string" || version.trim().length === 0) {
      return NextResponse.json({ error: "Version string is required" }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Unset all current versions
      await conn.execute("UPDATE echotrail_itemmanager_patch_versions SET is_current = 0");

      // Insert new version as current
      await conn.execute(
        "INSERT INTO echotrail_itemmanager_patch_versions (version, description, is_current, created_by) VALUES (?, ?, 1, ?)",
        [version.trim(), description?.trim() || null, session!.user.username]
      );

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Version already exists" }, { status: 409 });
    }
    console.error("Patch version create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

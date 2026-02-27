import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { description, isCurrent } = body;

    if (isCurrent === true) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute("UPDATE echotrail_itemmanager_patch_versions SET is_current = 0");
        await conn.execute("UPDATE echotrail_itemmanager_patch_versions SET is_current = 1 WHERE id = ?", [id]);
        await conn.commit();
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    }

    if (description !== undefined) {
      await pool.execute(
        "UPDATE echotrail_itemmanager_patch_versions SET description = ? WHERE id = ?",
        [description?.trim() || null, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Patch version update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    // Check if version is in use by any history entries
    const [versionRows] = await pool.execute(
      "SELECT version, is_current FROM echotrail_itemmanager_patch_versions WHERE id = ?",
      [id]
    ) as any;

    if (versionRows.length === 0) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (versionRows[0].is_current) {
      return NextResponse.json({ error: "Cannot delete the current active version" }, { status: 400 });
    }

    const version = versionRows[0].version;
    const [usageRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM echotrail_itemmanager_item_history WHERE patch_version = ?",
      [version]
    ) as any;

    if (usageRows[0].count > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${usageRows[0].count} history entries reference this version` },
        { status: 400 }
      );
    }

    await pool.execute("DELETE FROM echotrail_itemmanager_patch_versions WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Patch version delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

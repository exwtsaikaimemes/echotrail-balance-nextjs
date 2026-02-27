import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { commentSchema } from "@/lib/validators";
import { broadcastToAll } from "@/lib/ws-broadcast";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_item_comments WHERE item_id = ? ORDER BY created_at ASC",
      [id]
    ) as any;

    const comments = rows.map((row: any) => ({
      id: row.id,
      itemId: row.item_id,
      username: row.username,
      comment: row.comment,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ comments });
  } catch (err) {
    console.error("Comments fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const commentText = parsed.data.comment.trim();

    const [result] = await pool.execute(
      "INSERT INTO echotrail_itemmanager_item_comments (item_id, username, comment) VALUES (?, ?, ?)",
      [id, session!.user.username, commentText]
    ) as any;

    const [rows] = await pool.execute(
      "SELECT * FROM echotrail_itemmanager_item_comments WHERE id = ?",
      [result.insertId]
    ) as any;

    const created = {
      id: rows[0].id,
      itemId: rows[0].item_id,
      username: rows[0].username,
      comment: rows[0].comment,
      createdAt: rows[0].created_at,
    };

    broadcastToAll({
      type: "comment:created",
      itemId: id,
      comment: created,
      by: session!.user.username,
    });

    return NextResponse.json({ comment: created }, { status: 201 });
  } catch (err) {
    console.error("Comment create error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

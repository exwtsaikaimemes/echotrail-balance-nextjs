import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { username, password } = parsed.data;

    const [existing] = await pool.execute(
      "SELECT id FROM echotrail_itemmanager_users WHERE username = ?",
      [username]
    ) as any;

    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO echotrail_itemmanager_users (id, username, password) VALUES (?, ?, ?)",
      [id, username, hash]
    );

    return NextResponse.json({ user: { id, username } }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/database";
import { validateConfig } from "@/lib/config";

let db: Database | null = null;

function getDb() {
  const missing = validateConfig();
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
  if (!db) db = new Database();
  return db;
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 },
      );
    }

    const conversations = await db.getRecentConversations(userId, 30);
    return NextResponse.json({ conversations: conversations.reverse() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    const isMissingEnv = msg.startsWith("Missing env vars");
    console.error("[api/conversations] error:", error);
    return NextResponse.json(
      { error: isMissingEnv ? `Server not configured: ${msg}` : "Internal server error" },
      { status: isMissingEnv ? 503 : 500 },
    );
  }
}

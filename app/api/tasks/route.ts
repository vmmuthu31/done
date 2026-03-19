import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/database";

const db = new Database();

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 },
      );
    }

    const tasks = await db.getActiveTasksForUser(userId);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[api/tasks] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

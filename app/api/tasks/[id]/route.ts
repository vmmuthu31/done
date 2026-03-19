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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await req.json();
    const { stepIndex } = body as { stepIndex: number };

    if (typeof stepIndex !== "number") {
      return NextResponse.json(
        { error: "stepIndex (number) is required" },
        { status: 400 },
      );
    }

    const task = await db.getTask(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const steps = [...(task.steps ?? [])];

    if (stepIndex < 0 || stepIndex >= steps.length) {
      return NextResponse.json({ error: "stepIndex out of range" }, { status: 400 });
    }

    steps[stepIndex] = { ...steps[stepIndex], completed: !steps[stepIndex].completed };

    await db.updateTaskSteps(id, steps);

    const updated = await db.getTask(id);
    return NextResponse.json({ task: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    const isMissingEnv = msg.startsWith("Missing env vars");
    console.error("[api/tasks/[id]] error:", error);
    return NextResponse.json(
      { error: isMissingEnv ? `Server not configured: ${msg}` : "Internal server error" },
      { status: isMissingEnv ? 503 : 500 },
    );
  }
}

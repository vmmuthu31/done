import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/lib/ai";
import { Database } from "@/lib/database";
import { validateConfig } from "@/lib/config";
import { TaskStep } from "@/lib/types";

let ai: AIService | null = null;
let db: Database | null = null;

function getServices() {
  const missing = validateConfig();
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
  if (!ai) ai = new AIService();
  if (!db) db = new Database();
  return { ai, db };
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { ai, db } = getServices();

    const body = await req.json();
    const { message, userId } = body as { message: string; userId: string };

    if (!message?.trim() || !userId?.trim()) {
      return NextResponse.json(
        { error: "message and userId are required" },
        { status: 400 },
      );
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a minute." },
        { status: 429 },
      );
    }

    await db.saveConversation(userId, message, true);

    const conversationHistory = await db.getRecentConversations(userId);
    const activeTasks = await db.getActiveTasksForUser(userId);

    const isCompletion = await ai.detectTaskCompletion(message);

    if (isCompletion && activeTasks.length > 0) {
      const task = activeTasks[0];
      await db.updateTaskStatus(task.id, "completed");
      await db.updateTaskFollowup(task.id, null, false);

      const replies = [
        `Amazing! "${task.task_title}" is done. ✓`,
        `Completed! "${task.task_title}" is off your list.`,
        `Nice work! "${task.task_title}" is finished.`,
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];

      await db.saveConversation(userId, reply, false);
      return NextResponse.json({ reply, taskCompleted: task });
    }

    const shouldCreate = await ai.shouldCreateTask(message);

    if (shouldCreate) {
      const parsed = await ai.parseTask(message, conversationHistory);

      const steps: TaskStep[] = (parsed.steps || []).map((s) => ({
        text: s,
        completed: false,
      }));

      const nextFollowup = new Date();
      nextFollowup.setMinutes(nextFollowup.getMinutes() + 120);

      const task = await db.createTask(
        userId,
        message,
        parsed.title,
        parsed.description || null,
        steps,
        parsed.priority,
        nextFollowup,
      );

      await db.updateTaskStatus(task.id, "in_progress");

      let reply = `Got it! I've captured: "${parsed.title}"`;
      if (steps.length > 0) {
        reply += "\n\nHere are the steps:\n";
        reply += steps.map((s, i) => `${i + 1}. ${s.text}`).join("\n");
        reply += "\n\nStart with step 1?";
      } else {
        reply += "\n\nReady to tackle it?";
      }

      await db.saveConversation(userId, reply, false);
      return NextResponse.json({ reply, taskCreated: task });
    }

    const reply = await ai.generateResponse(
      message,
      activeTasks[0] ?? null,
      conversationHistory,
      activeTasks,
    );

    await db.saveConversation(userId, reply, false);
    return NextResponse.json({ reply });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    const isMissingEnv = msg.startsWith("Missing env vars");
    console.error("[api/chat] error:", error);
    return NextResponse.json(
      { error: isMissingEnv ? `Server not configured: ${msg}` : "Internal server error" },
      { status: isMissingEnv ? 503 : 500 },
    );
  }
}

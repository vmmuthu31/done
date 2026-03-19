import Groq from "groq-sdk";
import { config } from "./config";
import { ParsedTask, Conversation, Task } from "./types";

export class AIService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: config.groq.apiKey,
    });
  }

  async parseTask(
    message: string,
    conversationHistory: Conversation[],
  ): Promise<ParsedTask> {
    const context = conversationHistory
      .slice(-5)
      .map((c) => `${c.is_from_user ? "User" : "Agent"}: ${c.message_text}`)
      .join("\n");

    const systemPrompt = `You are an AI assistant that helps people stop procrastinating by breaking tasks into clear steps.

Rules:
1. Extract the core task from the user's message
2. Create a sharp, verb-first title (e.g. "Write Blog Post About AI")
3. Break it into 2-5 concrete, actionable steps — no vague steps like "think about it"
4. Assign priority: high (deadline/urgent), medium (important), low (nice-to-have)

Return JSON:
{
  "title": "Verb-first task title",
  "description": "One sentence of context if needed",
  "steps": ["Do X", "Do Y", "Do Z"],
  "priority": "medium"
}`;

    const userPrompt = context
      ? `Previous conversation:\n${context}\n\nNew message: ${message}`
      : `Message: ${message}`;

    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      title: result.title || message.substring(0, 100),
      description: result.description || undefined,
      steps: result.steps || [],
      priority: result.priority || "medium",
    };
  }

  async generateResponse(
    message: string,
    task: Task | null,
    conversationHistory: Conversation[],
    activeTasks: Task[],
  ): Promise<string> {
    const context = conversationHistory
      .slice(-5)
      .map((c) => `${c.is_from_user ? "User" : "Agent"}: ${c.message_text}`)
      .join("\n");

    let systemPrompt = `You are Done., an AI agent that eliminates procrastination.

Your ONLY job is to push the user to take the very next action — RIGHT NOW.

Rules you must never break:
- NEVER ask a question. Never say "would you like to..." or "shall I..." or "do you want to..."
- NEVER wait for permission. Just tell them what to do.
- ALWAYS prescribe one specific, immediate action in your reply.
- Keep replies to 1-3 short sentences max.
- If they have an active task, tell them exactly which step to work on next.
- If they seem stuck, tell them to do the smallest possible version of the next step.
- Celebrate completions in one sentence and immediately redirect to what's next.
- Be direct. Be warm. Never be passive.`;

    let userPrompt = message;

    if (task) {
      systemPrompt += `\n\nActive task: "${task.task_title}"`;
      if (task.steps && task.steps.length > 0) {
        const nextStep = task.steps.find((s) => !s.completed);
        if (nextStep) {
          systemPrompt += `\nNext step to push them on: "${nextStep.text}" — tell them to do this right now.`;
        } else {
          systemPrompt += `\nAll steps are done — celebrate and tell them to say "done" to close the task.`;
        }
        systemPrompt += `\nAll steps: ${task.steps.map((s) => `${s.completed ? "✓" : "○"} ${s.text}`).join(", ")}`;
      }
    }

    if (activeTasks.length > 0) {
      systemPrompt += `\n\nUser has ${activeTasks.length} active task(s).`;
    }

    if (context) {
      userPrompt = `Previous conversation:\n${context}\n\nNew message: ${message}`;
    }

    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return (
      response.choices[0].message.content ||
      "Got it. What would you like to work on?"
    );
  }

  async generateFollowupMessage(
    task: Task,
    followupCount: number,
  ): Promise<string> {
    const messages = [
      `Hey! Just checking in on "${task.task_title}". How's it going?`,
      `Still working on "${task.task_title}"? Let me know if you need help breaking it down differently.`,
      `"${task.task_title}" - should we mark this as done or put it aside for now?`,
    ];

    if (followupCount < messages.length) {
      return messages[followupCount];
    }

    return `Last check on "${task.task_title}". Want to complete it, or should I stop reminding you?`;
  }

  async detectTaskCompletion(message: string): Promise<boolean> {
    const completionKeywords = [
      "done",
      "finished",
      "completed",
      "sent",
      "did it",
      "all set",
      "checked off",
      "took care of",
    ];

    const lowerMessage = message.toLowerCase();
    return completionKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  async shouldCreateTask(message: string): Promise<boolean> {
    const taskIndicators = [
      "need to",
      "should",
      "have to",
      "want to",
      "going to",
      "planning to",
      "remind me",
      "todo",
      "task",
    ];

    const lowerMessage = message.toLowerCase();

    const isQuestion = message.includes("?");
    if (isQuestion && lowerMessage.includes("how")) return false;
    if (isQuestion && lowerMessage.includes("what")) return false;

    if (lowerMessage.length < 10) return false;

    return taskIndicators.some((indicator) => lowerMessage.includes(indicator));
  }
}

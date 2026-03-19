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

    const systemPrompt = `You are an AI assistant that helps people overcome procrastination by breaking down tasks.

Your job is to:
1. Extract the main task from what the user says
2. Create a clear, actionable title
3. Break it down into 2-5 concrete steps if it's complex
4. Determine priority (low, medium, high) based on urgency cues

Return a JSON object with this structure:
{
  "title": "Clear, actionable task title",
  "description": "Optional additional context",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "priority": "medium"
}

If the task is simple, steps can be empty. Focus on making things actionable.`;

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

    let systemPrompt = `You are Done., an iMessage agent that helps people overcome procrastination.

Your personality:
- Direct and action-oriented
- Supportive but not overly enthusiastic
- You break down tasks and help people start
- You follow up until things are done
- Keep responses concise (1-3 sentences)

Your role:
- Help users capture tasks naturally
- Break complex tasks into steps
- Suggest immediate next actions
- Celebrate completions simply
- Gently nudge on follow-ups`;

    let userPrompt = message;

    if (task) {
      systemPrompt += `\n\nCurrent task: "${task.task_title}"`;
      if (task.steps && task.steps.length > 0) {
        systemPrompt += `\nSteps: ${task.steps.map((s) => `- ${s.text} ${s.completed ? "✓" : ""}`).join("\n")}`;
      }
      systemPrompt += `\nStatus: ${task.status}`;
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

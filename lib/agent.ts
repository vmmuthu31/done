import { IMessageSDK } from "@photon-ai/imessage-kit";
import { Database } from "./database";
import { AIService } from "./ai";
import { FollowupScheduler } from "./scheduler";
import { TaskStep, Conversation, Task, ParsedTask } from "./types";

type IncomingMessage = {
  text: string | null;
  sender: string;
  id?: string;
};

export class DoneAgent {
  private sdk: IMessageSDK;
  private db: Database;
  private ai: AIService;
  private scheduler: FollowupScheduler;

  constructor() {
    this.sdk = new IMessageSDK({
      debug: true,
      watcher: {
        pollInterval: 2000,
        excludeOwnMessages: true,
      },
    });
    this.db = new Database();
    this.ai = new AIService();
    this.scheduler = new FollowupScheduler(this.sdk, this.db, this.ai);
  }

  async start(): Promise<void> {
    console.log("🚀 Done. agent starting...");

    await this.sdk.startWatching({
      onDirectMessage: async (msg) => {
        await this.handleMessage(msg);
      },
      onError: (error) => {
        console.error("Watcher error:", error);
      },
    });

    this.scheduler.start();

    console.log("✅ Done. agent is running");
    console.log("💬 Send a message to get started!");
  }

  async stop(): Promise<void> {
    console.log("🛑 Stopping Done. agent...");
    this.scheduler.stop();
    this.sdk.stopWatching();
    await this.sdk.close();
    console.log("👋 Done. agent stopped");
  }

  private async handleMessage(msg: IncomingMessage): Promise<void> {
    try {
      const text = msg.text ?? "";
      console.log(`\n📨 Received: "${text}" from ${msg.sender}`);

      await this.db.saveConversation(msg.sender, text, true);

      const conversationHistory: Conversation[] =
        await this.db.getRecentConversations(msg.sender);
      const activeTasks: Task[] = await this.db.getActiveTasksForUser(
        msg.sender,
      );

      const isCompletion = await this.ai.detectTaskCompletion(text);

      if (isCompletion && activeTasks.length > 0) {
        await this.handleTaskCompletion(msg.sender, activeTasks[0]);
        return;
      }

      const shouldCreateTask = await this.ai.shouldCreateTask(text);

      if (shouldCreateTask) {
        await this.handleNewTask(msg.sender, text, conversationHistory);
      } else {
        await this.handleGeneralMessage(
          msg.sender,
          text,
          conversationHistory,
          activeTasks,
        );
      }
    } catch (error) {
      console.error("Error handling message:", error);
      await this.sendResponse(
        msg.sender,
        "Sorry, I encountered an error. Please try again.",
      );
    }
  }

  private async handleNewTask(
    sender: string,
    message: string,
    conversationHistory: Conversation[],
  ): Promise<void> {
    console.log("📝 Creating new task...");

    const parsedTask: ParsedTask = await this.ai.parseTask(
      message,
      conversationHistory,
    );

    const steps: TaskStep[] = (parsedTask.steps || []).map((step) => ({
      text: step,
      completed: false,
    }));

    const nextFollowup = this.scheduler.calculateInitialFollowup();

    const task = await this.db.createTask(
      sender,
      message,
      parsedTask.title,
      parsedTask.description || null,
      steps,
      parsedTask.priority,
      nextFollowup,
    );

    console.log(`✅ Created task: "${task.task_title}"`);

    let response = `Got it! I've captured: "${parsedTask.title}"`;

    if (steps.length > 0) {
      response += "\n\nHere are the steps:\n";
      response += steps.map((s, i) => `${i + 1}. ${s.text}`).join("\n");
      response += "\n\nStart with step 1?";
    } else {
      response += "\n\nReady to tackle it?";
    }

    await this.sendResponse(sender, response);

    await this.db.updateTaskStatus(task.id, "in_progress");
  }

  private async handleTaskCompletion(
    sender: string,
    task: Task,
  ): Promise<void> {
    console.log(`✅ Marking task "${task.task_title}" as completed`);

    await this.db.updateTaskStatus(task.id, "completed");
    await this.db.updateTaskFollowup(task.id, null, false);

    const responses = [
      `Amazing! "${task.task_title}" is done. ✓`,
      `Completed! "${task.task_title}" is off your list.`,
      `Nice work! "${task.task_title}" is finished.`,
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    await this.sendResponse(sender, response);
  }

  private async handleGeneralMessage(
    sender: string,
    message: string,
    conversationHistory: Conversation[],
    activeTasks: Task[],
  ): Promise<void> {
    console.log("💬 Handling general message...");

    const currentTask = activeTasks.length > 0 ? activeTasks[0] : null;

    const response = await this.ai.generateResponse(
      message,
      currentTask,
      conversationHistory,
      activeTasks,
    );

    await this.sendResponse(sender, response);
  }

  private async sendResponse(sender: string, text: string): Promise<void> {
    await this.sdk.send(sender, text);
    await this.db.saveConversation(sender, text, false);
    console.log(`📤 Sent: "${text}"`);
  }
}

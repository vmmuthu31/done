import { IMessageSDK } from "@photon-ai/imessage-kit";
import { Database } from "./database";
import { Task } from "./types";
import { AIService } from "./ai";
import { config } from "./config";

export class FollowupScheduler {
  private intervalId?: NodeJS.Timeout;
  private sdk: IMessageSDK;
  private db: Database;
  private ai: AIService;

  constructor(sdk: IMessageSDK, db: Database, ai: AIService) {
    this.sdk = sdk;
    this.db = db;
    this.ai = ai;
  }

  start(): void {
    console.log("🔔 Starting followup scheduler...");

    this.intervalId = setInterval(async () => {
      await this.checkAndSendFollowups();
    }, 60000);

    this.checkAndSendFollowups();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log("🔕 Followup scheduler stopped");
    }
  }

  private async checkAndSendFollowups(): Promise<void> {
    try {
      const tasksDue: Task[] = await this.db.getTasksDueForFollowup();

      if (tasksDue.length === 0) {
        return;
      }

      console.log(`📬 Found ${tasksDue.length} task(s) due for followup`);

      for (const task of tasksDue) {
        await this.sendFollowup(task);
      }
    } catch (error) {
      console.error("Error checking followups:", error);
    }
  }

  private async sendFollowup(task: Task): Promise<void> {
    try {
      const message = await this.ai.generateFollowupMessage(
        task,
        task.followup_count,
      );

      await this.sdk.send(task.user_identifier, message);
      console.log(
        `✅ Sent followup to ${task.user_identifier}: "${task.task_title}"`,
      );

      await this.db.saveConversation(
        task.user_identifier,
        message,
        false,
        task.id,
      );

      const nextFollowup = this.calculateNextFollowup(task.followup_count + 1);

      if (nextFollowup) {
        await this.db.updateTaskFollowup(task.id, nextFollowup, true);
      } else {
        await this.db.updateTaskStatus(task.id, "abandoned");
        await this.db.updateTaskFollowup(task.id, null, true);
      }
    } catch (error) {
      console.error(`Error sending followup for task ${task.id}:`, error);
    }
  }

  private calculateNextFollowup(followupCount: number): Date | null {
    const delays = [
      config.followup.initialDelayMinutes,
      config.followup.secondDelayMinutes,
      config.followup.thirdDelayMinutes,
    ];

    if (followupCount >= config.followup.maxFollowups) {
      return null;
    }

    const delayMinutes = delays[followupCount] || delays[delays.length - 1];
    const nextFollowup = new Date();
    nextFollowup.setMinutes(nextFollowup.getMinutes() + delayMinutes);

    return nextFollowup;
  }

  calculateInitialFollowup(): Date {
    const followup = new Date();
    followup.setMinutes(
      followup.getMinutes() + config.followup.initialDelayMinutes,
    );
    return followup;
  }
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";
import { Task, Conversation, TaskStatus, TaskStep } from "./types";

export class Database {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey);
  }

  async updateTaskSteps(taskId: string, steps: TaskStep[]): Promise<void> {
    const { error } = await this.supabase
      .from("tasks")
      .update({ steps, updated_at: new Date().toISOString() })
      .eq("id", taskId);
    if (error) throw error;
  }

  async createTask(
    userIdentifier: string,
    originalMessage: string,
    taskTitle: string,
    taskDescription: string | null,
    steps: TaskStep[],
    priority: string,
    nextFollowupAt: Date | null,
  ): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert({
        user_identifier: userIdentifier,
        original_message: originalMessage,
        task_title: taskTitle,
        task_description: taskDescription,
        steps: steps,
        priority: priority,
        next_followup_at: nextFollowupAt?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);

    if (error) throw error;
  }

  async updateTaskFollowup(
    taskId: string,
    nextFollowupAt: Date | null,
    incrementCount: boolean = true,
  ): Promise<void> {
    const updates: Record<string, unknown> = {
      next_followup_at: nextFollowupAt?.toISOString() || null,
      updated_at: new Date().toISOString(),
    };

    if (incrementCount) {
      const { data } = await this.supabase
        .from("tasks")
        .select("followup_count")
        .eq("id", taskId)
        .single();

      if (data && typeof data.followup_count === "number") {
        updates.followup_count = (data.followup_count || 0) + 1;
      }
    }

    const { error } = await this.supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);

    if (error) throw error;
  }

  async updateTaskInteraction(taskId: string): Promise<void> {
    const { error } = await this.supabase
      .from("tasks")
      .update({
        last_interaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) throw error;
  }

  async getActiveTasksForUser(userIdentifier: string): Promise<Task[]> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  }

  async getTasksDueForFollowup(): Promise<Task[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .in("status", ["pending", "in_progress"])
      .not("next_followup_at", "is", null)
      .lte("next_followup_at", now);

    if (error) throw error;
    return data as Task[];
  }

  async getTask(taskId: string): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .maybeSingle();

    if (error) throw error;
    return data as Task | null;
  }

  async saveConversation(
    userIdentifier: string,
    messageText: string,
    isFromUser: boolean,
    taskId?: string,
  ): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from("conversations")
      .insert({
        user_identifier: userIdentifier,
        message_text: messageText,
        is_from_user: isFromUser,
        task_id: taskId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Conversation;
  }

  async getRecentConversations(
    userIdentifier: string,
    limit: number = 10,
  ): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from("conversations")
      .select("*")
      .eq("user_identifier", userIdentifier)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Conversation[];
  }
}

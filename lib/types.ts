export type TaskStatus = "pending" | "in_progress" | "completed" | "abandoned";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskStep {
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_identifier: string;
  original_message: string;
  task_title: string;
  task_description: string | null;
  steps: TaskStep[];
  status: TaskStatus;
  priority: TaskPriority;
  next_followup_at: Date | null;
  followup_count: number;
  last_interaction_at: Date;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  user_identifier: string;
  task_id: string | null;
  message_text: string;
  is_from_user: boolean;
  created_at: Date;
}

export interface ParsedTask {
  title: string;
  description?: string;
  steps?: string[];
  priority: TaskPriority;
}

"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  MessageSquare,
  ListTodo,
  Loader2,
  PanelLeft,
  X,
  Circle,
} from "lucide-react";
import type { Task } from "@/lib/types";

type MessageRole = "user" | "agent";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
}

function getUserId(): string {
  if (typeof window === "undefined") return "demo-user";
  let id = localStorage.getItem("done_user_id");
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("done_user_id", id);
  }
  return id;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    Promise.all([fetchHistory(id), fetchTasks(id)]).finally(() =>
      setHistoryLoading(false),
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!historyLoading) inputRef.current?.focus();
  }, [historyLoading]);

  async function fetchHistory(id: string) {
    try {
      const res = await fetch(
        `/api/conversations?userId=${encodeURIComponent(id)}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      const convos = data.conversations ?? [];

      if (convos.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "agent",
            text: "Hey! I'm Done. — text me anything you've been putting off. I'll break it down and keep you on track. 💬",
          },
        ]);
        return;
      }

      setMessages(
        convos.map(
          (c: { id: string; is_from_user: boolean; message_text: string }) => ({
            id: c.id,
            role: c.is_from_user ? "user" : "agent",
            text: c.message_text,
          }),
        ),
      );
    } catch {
      setMessages([
        {
          id: "welcome",
          role: "agent",
          text: "Hey! I'm Done. — text me anything you've been putting off. I'll break it down and keep you on track. 💬",
        },
      ]);
    }
  }

  async function fetchTasks(id: string) {
    try {
      const res = await fetch(`/api/tasks?userId=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      setTasks([]);
    }
  }

  async function toggleStep(taskId: string, stepIndex: number) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIndex }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
    } catch {
      console.log("Response failed");
    }
  }

  async function callAgent(message: string) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Unknown error");

    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "agent", text: data.reply },
    ]);

    await fetchTasks(userId);

    if (data.taskCreated) {
      await pushNextStep();
    }

    return data;
  }

  async function pushNextStep() {
    await new Promise((r) => setTimeout(r, 600));
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "__push__", userId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 2).toString(), role: "agent", text: data.reply },
    ]);
    await fetchTasks(userId);
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      await callAgent(text);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          text: "Hmm, something went wrong. Make sure your API keys are configured and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const TaskSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight font-mono text-slate-900">
            Done.
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <ListTodo className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Active Tasks
          </span>
        </div>

        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <p className="text-slate-400 text-sm leading-relaxed">
                No active tasks yet.
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Tell me what you&apos;ve been putting off!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2 mb-3">
                  <Circle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {task.task_title}
                  </p>
                </div>
                {task.steps && task.steps.length > 0 && (
                  <ul className="space-y-2 pl-6 mb-3">
                    {task.steps.map((step, i) => (
                      <li key={i} className="flex items-center gap-2 group">
                        <button
                          onClick={() => toggleStep(task.id, i)}
                          className="shrink-0 focus:outline-none"
                          aria-label={`Mark step ${i + 1} ${step.completed ? "incomplete" : "complete"}`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 group-hover:border-blue-400 transition-colors" />
                          )}
                        </button>
                        <span
                          className={`text-xs leading-snug ${
                            step.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-600"
                          }`}
                        >
                          {step.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                      task.priority === "high"
                        ? "bg-red-50 text-red-500 border border-red-100"
                        : task.priority === "medium"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Say <span className="text-slate-700 font-medium">&quot;done&quot;</span> to
          complete your current task.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-slate-100 bg-white shrink-0">
        <TaskSidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-40 md:hidden border-r border-slate-200 flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
              <TaskSidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header — mirrors landing page Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Open tasks"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          {/* Logo mark */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight font-mono text-slate-900">
              Done.
            </span>
          </div>

          <div className="flex-1" />

          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-slate-600">Agent Active</span>
          </div>

          {/* Mobile tasks badge */}
          {tasks.length > 0 && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ListTodo className="w-3.5 h-3.5" />
              {tasks.length}
            </button>
          )}

          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 bg-slate-50">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your history…
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "agent" && (
                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-xs font-bold text-white mr-2.5 mt-1 shrink-0 shadow-sm">
                      D
                    </div>
                  )}
                  <div
                    className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-sm"
                        : "bg-white text-slate-800 rounded-tl-sm border border-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-xs font-bold text-white mr-2.5 mt-1 shrink-0 shadow-sm">
                    D
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500">Thinking…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 md:px-8 py-4 bg-white border-t border-slate-100">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-slate-900 transition-colors shadow-sm"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Text me anything you've been putting off…"
              disabled={loading || !userId || historyLoading}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !userId || historyLoading}
              className="w-8 h-8 bg-slate-900 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </form>
          <p className="text-center text-[11px] text-slate-400 mt-2.5">
            Your session is stored locally · No account needed
          </p>
        </div>
      </main>
    </div>
  );
}

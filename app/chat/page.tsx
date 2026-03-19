"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, Circle, ListTodo, Loader2 } from "lucide-react";
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

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      text: "Hey! I'm Done. — text me anything you've been putting off. I'll break it down and keep you on track. 💬",
    },
  ]);
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    fetchTasks(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchTasks(id: string) {
    try {
      const res = await fetch(`/api/tasks?userId=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      console.log('Error fetching tasks');
      setTasks([]);
    }
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: data.reply,
      };
      setMessages((prev) => [...prev, agentMsg]);
      await fetchTasks(userId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          text: "Hmm, something went wrong on my end. Make sure your API keys are set and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <aside className="hidden md:flex flex-col w-72 border-r border-white/10 bg-slate-900">
        <div className="p-5 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">
              D.
            </div>
            <span className="font-bold tracking-tight">Done. Agent</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Tasks
            </span>
          </div>

          <AnimatePresence>
            {tasks.length === 0 ? (
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                No active tasks yet. Tell me something you&apos;ve been putting off!
              </p>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-3 bg-slate-800 rounded-xl p-3 border border-white/5"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Circle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-white leading-snug">
                      {task.task_title}
                    </p>
                  </div>
                  {task.steps && task.steps.length > 0 && (
                    <ul className="space-y-1 pl-6">
                      {task.steps.map((step, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          {step.completed ? (
                            <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-slate-500 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs ${step.completed ? "text-slate-500 line-through" : "text-slate-300"}`}
                          >
                            {step.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        task.priority === "high"
                          ? "bg-red-900/60 text-red-300"
                          : task.priority === "medium"
                            ? "bg-amber-900/60 text-amber-300"
                            : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">{task.status.replace("_", " ")}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-white/10">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Tasks sync with Supabase in real-time. Say <span className="text-slate-300">&quot;done&quot;</span> to complete a task.
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
          <Link
            href="/"
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
            D.
          </div>
          <div>
            <p className="font-semibold text-sm">Done. Agent</p>
            <p className="text-[11px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Active
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
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
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0">
                    D
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-100 rounded-tl-sm border border-white/5"
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
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0">
                  D
                </div>
                <div className="bg-slate-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-slate-400">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-6 pt-2 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-blue-500/50 transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Text me anything you've been putting off…"
              disabled={loading || !userId}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !userId}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            Your session is stored locally. No account needed.
          </p>
        </div>
      </main>
    </div>
  );
}

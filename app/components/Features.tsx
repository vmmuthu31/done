import { motion } from "framer-motion";
import {
  Zap,
  MessageSquare,
  Bell,
  ListChecks,
  BrainCircuit,
  Repeat,
} from "lucide-react";

const features = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Natural Language Capture",
    description:
      "Text in plain English. No commands, no syntax, no friction. Just talk like you're texting a friend.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "Task Decomposition",
    description:
      "Vague goals like 'start a business' are automatically broken down into clear, actionable micro-steps.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Action-Oriented",
    description:
      "Done. doesn't just remind you; it drafts emails, schedules meetings, and researches for you.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Persistent Follow-ups",
    description:
      "The agent proactively nudges you until the task is finished. It's the accountability partner that never sleeps.",
  },
  {
    icon: <ListChecks className="w-6 h-6" />,
    title: "Status Tracking",
    description:
      "Keep track of everything in progress without ever leaving your message thread.",
  },
  {
    icon: <Repeat className="w-6 h-6" />,
    title: "Habit Building",
    description:
      "Designed to turn intention into execution, helping you build consistent productivity habits.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Execution, not just intention.
          </h2>
          <p className="text-lg text-slate-600">
            Most productivity tools fail because they require you to open an
            app. Done. meets you where you already are.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              iMessage Native Agent
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
            From &quot;I should&quot; <br />
            <span className="text-blue-600 italic">to &quot;I did.&quot;</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
            Text anything you’re procrastinating. Done. breaks it down, starts
            it, and follows up until it’s completed. No apps, no friction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1">
              Text Done. <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
              See how it works
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 bg-white rounded-[3rem] p-4 shadow-2xl border-[8px] border-slate-900 max-w-[380px] mx-auto">
            <div className="bg-slate-50 rounded-[2.5rem] h-[600px] overflow-hidden flex flex-col">
              <div className="bg-white/80 backdrop-blur-sm p-4 border-b border-slate-200 flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-200 rounded-full mb-1 flex items-center justify-center text-slate-500 font-bold">
                  D
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Done. Agent
                </span>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                    I&apos;ve been putting off that project proposal for 3 days.
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
                    Got it. Let&apos;s knock it out. I&apos;ve broken it into 3
                    steps: 1. Outline goals, 2. Draft budget, 3. Final review.
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm font-medium">
                    I&apos;ve drafted a starting outline for you. Want me to
                    send it to your email?
                  </div>
                </motion.div>
                <div className="flex justify-end">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm"
                  >
                    Yes please.
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] text-sm">
                    Sent! I&apos;ll check back in 2 hours to see how the budget
                    draft is coming along. 🚀
                  </div>
                </motion.div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <div className="bg-slate-100 rounded-full px-4 py-2 text-slate-400 text-sm flex justify-between items-center">
                  iMessage
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl -z-10 opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-slate-200 rounded-full blur-3xl -z-10 opacity-50"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

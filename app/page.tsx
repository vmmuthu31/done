"use client";
import Link from "next/link";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main>
        <Hero />

        <section className="py-12 border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
              Trusted by high-performers at
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale">
              <span className="text-2xl font-bold font-mono">LINEAR</span>
              <span className="text-2xl font-bold font-mono">VERCEL</span>
              <span className="text-2xl font-bold font-mono">STRIPE</span>
              <span className="text-2xl font-bold font-mono">NOTION</span>
              <span className="text-2xl font-bold font-mono">FRAMER</span>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Features />

        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                  Stop thinking. <br />
                  Start finishing.
                </h2>
                <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto">
                  Join 10,000+ users who have turned their procrastination into
                  a streak of completed tasks.
                </p>
                <Link
                  href="/chat"
                  className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-xl inline-block hover:scale-105 transition-transform active:scale-95 shadow-2xl"
                >
                  Text Done. Now
                </Link>
              </div>
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

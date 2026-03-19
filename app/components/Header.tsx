import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

const words = ["Done.", "Doing.", "Scheduled.", "Completed."];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting) {
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length + 1));
      }, 80);

      if (text === currentWord) {
        timeout = setTimeout(() => setIsDeleting(true), 1200);
      }
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.slice(0, text.length - 1));
      }, 40);

      if (text === "") {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }, 50);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight font-mono">
            <span className="bg-linear-to-r from-purple-500 via-pink-500 to-red-500 bg-size-[200%_200%] bg-clip-text text-transparent animate-gradient">
              {text}
            </span>
            <span className="ml-1 border-r-2 border-slate-900 animate-blink"></span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            How it Works
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Features
          </a>
          <Link
            href="/chat"
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform active:scale-95"
          >
            Get Started
          </Link>
        </nav>

        <button className="md:hidden text-slate-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;

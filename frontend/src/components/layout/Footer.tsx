"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-panel mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center neon-glow">
              <Bot className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm text-green-200/60">
              &copy; 2024 AI Agents
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/agents"
              className="text-green-200/70 hover:text-emerald-300 transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/marketplace"
              className="text-green-200/70 hover:text-emerald-300 transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-green-200/70 hover:text-emerald-300 transition-colors"
            >
              Create
            </Link>
            <Link
              href="/profile"
              className="text-green-200/70 hover:text-emerald-300 transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

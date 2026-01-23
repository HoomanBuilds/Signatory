"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#333] bg-[#000000] w-full">
      <div className="w-full px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <Bot className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm text-gray-500">
              &copy; 2024 AI Agents
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/agents"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/marketplace"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link
              href="/profile"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

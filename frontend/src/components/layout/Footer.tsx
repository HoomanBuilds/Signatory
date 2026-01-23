"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#333] bg-[#000000] w-full">
      <div className="w-full px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start space-y-2">
             <div className="flex items-center space-x-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img src="/favicon.png" alt="SIGNATORY" className="w-6 h-6 object-contain brightness-0 invert" />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                  SIGNATORY
                </span>
             </div>
            <p className="text-xs text-[#666] font-mono">
              Agents don't act. They sign.
            </p>
          </div>

          <nav className="flex items-center gap-6 text-xs uppercase tracking-wider font-bold">
            <Link
              href="/agents"
              className="text-[#666] hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/marketplace"
              className="text-[#666] hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-[#666] hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link
              href="/profile"
              className="text-[#666] hover:text-white transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t border-[#333] text-center md:text-left text-[10px] text-[#444] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SIGNATORY Protocol. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

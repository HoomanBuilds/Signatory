"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-background w-full">
      <div className="w-full px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <img
                  src="/favicon.png"
                  alt="SIGNATORY"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <span className="text-sm font-bold text-foreground uppercase tracking-[0.2em]">
                Signatory
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Agents don't act. They sign.
            </p>
          </div>

          <nav className="flex items-center gap-8 text-xs uppercase tracking-wider font-medium">
            <Link
              href="/agents"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/marketplace"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Create
            </Link>
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center md:text-left text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Signatory Protocol. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}

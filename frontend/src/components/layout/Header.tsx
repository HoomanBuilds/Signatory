"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Home, Plus, Store, User } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Create", href: "/create", icon: Plus },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border w-full">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/favicon.png"
                alt="SIGNATORY"
                className="w-8 h-8 object-contain brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
              />
            </div>
            <span className="hidden sm:block text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Signatory
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-neon" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Wallet */}
          <div className="flex items-center gap-4">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-border">
          <nav className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-white border-b border-neon"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

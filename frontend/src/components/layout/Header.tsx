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
    <header className="glass-panel sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-lg flex items-center justify-center neon-glow">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
              AI Agents
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-300 bg-[#0f1b16] accent-ring"
                      : "text-gray-300 hover:text-emerald-300 hover:bg-[#0c1411]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>

        <div className="md:hidden border-t border-[#133027]">
          <nav className="flex space-x-4 py-2 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-emerald-300 bg-[#0f1b16] accent-ring"
                      : "text-gray-300 hover:text-emerald-300 hover:bg-[#0c1411]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
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

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
    <header className="sticky top-0 z-50 bg-[#000000] border-b border-[#333] w-full">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/favicon.png" alt="SIGNATORY" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-[#1a1a1a]"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>

        <div className="md:hidden border-t border-[#333]">
          <nav className="flex space-x-4 py-2 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-white bg-[#1a1a1a]"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
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

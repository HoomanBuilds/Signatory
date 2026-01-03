"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

interface AgentCardProps {
  tokenId: number;
  name: string;
  level: number;
  imageUrl?: string;
  price?: string;
  isListed?: boolean;
}

export default function AgentCard({
  tokenId,
  name,
  level,
  imageUrl,
  price,
  isListed,
}: AgentCardProps) {
  return (
    <Link
      href={`/agent/${tokenId}`}
      className="glass-panel p-3 rounded-xl hover:bg-[#0e1518] transition-all duration-300 group border border-transparent hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-lime-500/20 rounded-lg mb-2 flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-500/50 transition-all overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <Bot className="w-12 h-12 text-emerald-300/50" />
        )}
        {isListed && price && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm text-black text-xs font-bold rounded">
            {price} ETH
          </div>
        )}
      </div>
      <h3 className="text-sm font-bold text-emerald-200 mb-1 truncate">
        {name}
      </h3>
      <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/20">
        Level {level}
      </span>
    </Link>
  );
}

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
      className="block bg-black border border-[#333] hover:border-white transition-colors duration-200 group relative"
    >
      <div className="aspect-square bg-[#111] border-b border-[#333] flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Bot className="w-12 h-12 text-[#333]" />
        )}
        {isListed && price && (
          <div className="absolute top-0 right-0 px-2 py-1 bg-white text-black text-xs font-bold">
            {price} TCRO
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-white mb-1 truncate group-hover:underline decoration-1 underline-offset-4">
          {name}
        </h3>
        <span className="inline-block text-[#666] text-xs uppercase tracking-wider">
          Level {level}
        </span>
      </div>
    </Link>
  );
}

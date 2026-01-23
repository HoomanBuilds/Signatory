"use client";

import { Bot } from "lucide-react";

interface AgentImageProps {
  imageUrl?: string;
  name: string;
  level: number;
  chatCount: number;
  tokenId: number;
}

export default function AgentImage({
  imageUrl,
  name,
  level,
  chatCount,
  tokenId,
}: AgentImageProps) {
  return (
    <div className="bg-black p-4 border border-[#333]">
      <div className="w-full max-w-sm mx-auto aspect-square bg-[#111] mb-6 flex items-center justify-center border border-[#333] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Bot className="w-20 h-20 text-[#333]" />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-0 border border-[#333] divide-x divide-[#333]">
        <div className="p-4 text-center">
          <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Level</div>
          <div className="text-xl font-bold text-white font-mono">{level}</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Chats</div>
          <div className="text-xl font-bold text-white font-mono">{chatCount}</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xs text-[#666] uppercase tracking-wider mb-1">ID</div>
          <div className="text-xl font-bold text-white font-mono">#{tokenId}</div>
        </div>
      </div>
    </div>
  );
}

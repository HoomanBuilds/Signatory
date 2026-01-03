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
    <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20">
      <div className="w-full max-w-sm mx-auto aspect-square bg-gradient-to-br from-emerald-500/20 to-lime-500/20 rounded-xl mb-4 flex items-center justify-center border border-emerald-500/30 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Bot className="w-20 h-20 text-emerald-300/50" />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-panel p-2.5 rounded-lg text-center border border-emerald-500/10">
          <div className="text-xs text-green-200/60 mb-0.5">Level</div>
          <div className="text-lg font-bold text-emerald-300">{level}</div>
        </div>
        <div className="glass-panel p-2.5 rounded-lg text-center border border-emerald-500/10">
          <div className="text-xs text-green-200/60 mb-0.5">Chats</div>
          <div className="text-lg font-bold text-emerald-300">{chatCount}</div>
        </div>
        <div className="glass-panel p-2.5 rounded-lg text-center border border-emerald-500/10">
          <div className="text-xs text-green-200/60 mb-0.5">ID</div>
          <div className="text-lg font-bold text-emerald-300">#{tokenId}</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
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
    <div className="bg-background p-4 border border-ink-08">
      <div className="corner-ticks w-full max-w-sm mx-auto aspect-square bg-surface-2 mb-6 flex items-center justify-center border border-ink-08 overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover"
            priority
          />
        ) : (
          <Bot className="w-20 h-20 text-ink-24" />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-0 border border-ink-08 divide-x divide-ink-08">
        <div className="p-4 text-center">
          <div className="text-xs text-ink-40 uppercase tracking-wider mb-1">Level</div>
          <div className="text-xl font-bold text-ink font-mono">{level}</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xs text-ink-40 uppercase tracking-wider mb-1">Chats</div>
          <div className="text-xl font-bold text-ink font-mono">{chatCount}</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xs text-ink-40 uppercase tracking-wider mb-1">ID</div>
          <div className="text-xl font-bold text-ink font-mono">#{tokenId}</div>
        </div>
      </div>
    </div>
  );
}


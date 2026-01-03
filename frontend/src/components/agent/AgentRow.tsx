"use client";

import Link from "next/link";
import { MessageCircle, Zap } from "lucide-react";
import { formatEther } from "viem";

interface AgentRowProps {
  tokenId: number;
  name: string;
  imageUrl?: string;
  creator: string;
  chatCount: number;
  level: number;
  price?: bigint;
  isListed?: boolean;
}

export default function AgentRow({
  tokenId,
  name,
  imageUrl,
  creator,
  chatCount,
  level,
  price,
  isListed = false,
}: AgentRowProps) {
  return (
    <Link
      href={`/agent/${tokenId}`}
      className="glass-panel p-4 rounded-xl hover:bg-[#0e1518] transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Agent Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500/20 to-lime-500/20">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🤖
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-emerald-200 truncate">
                {name}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full flex-shrink-0">
                Lv.{level}
              </span>
            </div>
            <div className="text-xs text-green-200/50 truncate">
              by {creator.slice(0, 6)}...{creator.slice(-4)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-green-200/70">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{chatCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Active</span>
          </div>
        </div>

        {/* Price/Action */}
        {isListed && price ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-300">
                {formatEther(price)} ETH
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-black text-sm font-semibold rounded-lg hover:from-emerald-400 hover:to-lime-400 transition-all">
              Buy
            </button>
          </div>
        ) : (
          <button className="px-4 py-2 glass-panel text-emerald-200 text-sm font-medium rounded-lg hover:bg-[#0e1518] transition-all flex-shrink-0">
            View
          </button>
        )}
      </div>
    </Link>
  );
}

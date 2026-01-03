"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

interface AgentCardLargeProps {
  tokenId: number;
  name: string;
  level: number;
  imageUrl?: string;
  price?: string;
  href?: string;
  onBuyClick?: () => void;
}

export default function AgentCardLarge({
  tokenId,
  name,
  level,
  imageUrl,
  price,
  href,
  onBuyClick,
}: AgentCardLargeProps) {
  const link = href || `/agent/${tokenId}`;

  return (
    <Link
      href={link}
      className="glass-panel p-6 rounded-xl hover:bg-[#0e1518] transition-all duration-300 group border border-transparent hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-lime-500/20 rounded-lg mb-4 flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-500/50 transition-all overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <Bot className="w-16 h-16 text-emerald-300/50" />
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold text-emerald-200 mb-2 truncate">{name}</h3>

      <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full mb-4 border border-emerald-500/20">
        Level {level}
      </span>

      {/* Price Section */}
      {price && (
        <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
          <div>
            <div className="text-xs text-green-200/50 mb-1">Price</div>
            <div className="text-xl font-bold text-emerald-300">
              {price} ETH
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuyClick?.();
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-black text-sm font-bold rounded-lg hover:from-emerald-400 hover:to-lime-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Buy Now
          </button>
        </div>
      )}
    </Link>
  );
}

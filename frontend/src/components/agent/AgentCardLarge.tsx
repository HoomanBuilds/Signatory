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
      className="block bg-black border border-[#333] hover:border-white transition-all duration-300 group p-4"
    >
      {/* Image */}
      <div className="aspect-square bg-[#111] mb-4 flex items-center justify-center border border-[#333] overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <Bot className="w-16 h-16 text-[#333]" />
        )}
        
        {/* Level Tag (Overlay) */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 border border-[#333] text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
          Lvl {level}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div>
           <h3 className="text-lg font-bold text-white truncate uppercase tracking-wide">{name}</h3>
           <p className="text-xs text-[#666] font-mono">#{tokenId}</p>
        </div>

        {/* Price Section */}
        {price && (
          <div className="flex items-center justify-between pt-3 border-t border-[#333]">
            <div>
              <div className="text-[10px] text-[#666] uppercase tracking-wider mb-0.5">Price</div>
              <div className="text-lg font-bold text-white font-mono">
                {price} TCRO
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBuyClick?.();
              }}
              className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#ccc] transition-all border border-transparent"
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}

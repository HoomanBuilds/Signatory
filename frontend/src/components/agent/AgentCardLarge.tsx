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
      className="block bg-background border border-border hover:border-foreground/30 transition-all duration-300 group p-4"
    >
      {/* Image */}
      <div className="aspect-square bg-secondary mb-4 flex items-center justify-center border border-border overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <Bot className="w-16 h-16 text-muted-foreground/30" />
        )}

        {/* Level Tag */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 border border-border text-foreground text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
          Lvl {level}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground truncate uppercase tracking-wide group-hover:text-signal transition-colors">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">#{tokenId}</p>
        </div>

        {/* Price Section */}
        {price && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                Price
              </div>
              <div className="text-lg font-bold text-foreground font-mono">
                {price} TCRO
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBuyClick?.();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all border border-transparent"
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}

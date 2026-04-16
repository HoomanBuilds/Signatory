"use client";

import Link from "next/link";
import Image from "next/image";
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
      className="block bg-background border border-border hover:border-foreground/30 transition-all duration-300 group relative"
    >
      <div className="aspect-square bg-secondary border-b border-border flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <Bot className="w-12 h-12 text-muted-foreground/30" />
        )}
        {isListed && price && (
          <div className="absolute top-0 right-0 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold z-10">
            {price} TCRO
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-foreground mb-1 truncate group-hover:text-neon transition-colors">
          {name}
        </h3>
        <span className="inline-block text-muted-foreground text-xs uppercase tracking-wider">
          Level {level}
        </span>
      </div>
    </Link>
  );
}

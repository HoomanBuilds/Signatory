"use client";

import Link from "next/link";
import Image from "next/image";
import { Bot } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

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
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className="relative"
    >
      <Link
        ref={ref}
        href={`/agent/${tokenId}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block bg-surface-2 border border-ink-08 hover:border-signal/60 transition-all duration-300 group relative hover:shadow-[0_0_30px_-5px_rgba(62,231,145,0.35)] hover:-translate-y-0.5"
      >
        <div className="aspect-square bg-surface-3 border-b border-ink-08 flex items-center justify-center overflow-hidden relative">
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
            <Bot className="w-12 h-12 text-ink-24" />
          )}
          {isListed && price && (
            <div className="sigil-stamp absolute top-0 right-0 px-2 py-1 bg-sigil text-background text-[10px] font-mono font-bold tracking-wider z-10 uppercase">
              {price} TCRO
            </div>
          )}
          <div className="absolute top-0 left-0 px-2 py-1 font-mono text-[9px] text-ink-40 uppercase tracking-[0.2em]">
            #{String(tokenId).padStart(3, "0")}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-base text-ink mb-1 truncate group-hover:text-signal transition-colors">
            {name}
          </h3>
          <span className="inline-block font-mono text-ink-40 text-[10px] uppercase tracking-[0.2em]">
            lvl_{String(level).padStart(2, "0")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

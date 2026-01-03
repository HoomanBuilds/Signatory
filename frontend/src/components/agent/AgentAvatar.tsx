import { Bot } from "lucide-react";
import { resolveIPFS } from "@/lib/pinata";

interface AgentAvatarProps {
  imageUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AgentAvatar({
  imageUrl,
  name,
  size = "md",
  className = "",
}: AgentAvatarProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500/20 to-lime-500/20 border border-emerald-500/30 flex items-center justify-center ${className}`}
    >
      {imageUrl ? (
        <img
          src={resolveIPFS(imageUrl)}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <Bot className={`${iconSizes[size]} text-emerald-300/50`} />
      )}
    </div>
  );
}

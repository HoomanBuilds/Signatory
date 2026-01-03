import AgentAvatar from "../agent/AgentAvatar";
import { AgentData } from "@/hooks/useAgentData";

interface ChatHeaderProps {
  agent: AgentData;
}

export default function ChatHeader({ agent }: ChatHeaderProps) {
  return (
    <div className="glass-panel border-b border-emerald-500/20 p-4 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-10">
      <div className="relative">
        <AgentAvatar imageUrl={agent.imageUrl} name={agent.name} size="sm" />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-emerald-200">{agent.name}</h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
            Online
          </span>
        </div>
        <p className="text-sm text-green-200/70 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
          Level {agent.level}
          <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
          {agent.chatCount} chats
        </p>
      </div>
    </div>
  );
}

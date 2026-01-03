import { Loader2 } from "lucide-react";
import AgentAvatar from "../agent/AgentAvatar";
import { AgentData } from "@/hooks/useAgentData";

interface AgentSidebarProps {
  agents: AgentData[];
  isLoading: boolean;
  selectedAgentId: number | null;
  onSelectAgent: (tokenId: number) => void;
}

export default function AgentSidebar({
  agents,
  isLoading,
  selectedAgentId,
  onSelectAgent,
}: AgentSidebarProps) {
  return (
    <div className="w-64 glass-panel border-r border-emerald-500/20 overflow-y-auto">
      <div className="p-4 border-b border-emerald-500/20">
        <h2 className="text-xl font-bold text-emerald-200">Your Agents</h2>
        <p className="text-sm text-green-200/70 mt-1">
          {agents.length} agent{agents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="p-4 text-center">
          <div className="text-4xl mb-2">🤖</div>
          <p className="text-green-200/70 text-sm">
            You don't own any agents yet
          </p>
        </div>
      ) : (
        <div className="p-2 space-y-2">
          {agents.map((agent) => (
            <button
              key={agent.tokenId}
              onClick={() => onSelectAgent(agent.tokenId)}
              className={`w-full p-3 rounded-xl transition-all flex items-center gap-3 ${selectedAgentId === agent.tokenId
                ? "bg-emerald-500/20"
                : "glass-panel border border-emerald-500/10 hover:border-emerald-500/30"
                }`}
            >
              <AgentAvatar
                imageUrl={agent.imageUrl}
                name={agent.name}
                size="sm"
                className={
                  selectedAgentId === agent.tokenId
                    ? "ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] border-transparent"
                    : ""
                }
              />
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-emerald-200 truncate">
                  {agent.name}
                </div>
                <div className="text-xs text-green-200/70">
                  Level {agent.level}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

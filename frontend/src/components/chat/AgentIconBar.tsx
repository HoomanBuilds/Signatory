import { Loader2, Lock } from "lucide-react";
import AgentAvatar from "../agent/AgentAvatar";
import { AgentData } from "@/hooks/useAgentData";

interface AgentIconBarProps {
  myAgents: AgentData[];
  interactedAgents: AgentData[];
  privacySettings?: Record<number, boolean>;
  isLoading: boolean;
  selectedAgentId: number | null;
  onSelectAgent: (tokenId: number) => void;
}

export default function AgentIconBar({
  myAgents,
  interactedAgents,
  privacySettings = {},
  isLoading,
  selectedAgentId,
  onSelectAgent,
}: AgentIconBarProps) {

  const renderAgentButton = (agent: AgentData, isOwned: boolean) => {
    // If owned, it's never private to me. If not owned, check settings.
    const isPublic = privacySettings[agent.tokenId] !== false; 
    const isLocked = !isPublic && !isOwned;

    return (
      <button
        key={agent.tokenId}
        onClick={() => onSelectAgent(agent.tokenId)}
        className={`w-full aspect-square rounded-lg transition-all relative group ${
          selectedAgentId === agent.tokenId
            ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-900"
            : isLocked 
              ? "opacity-60 grayscale hover:opacity-80" 
              : "opacity-60 hover:opacity-100"
        }`}
        title={isLocked ? "Private Agent (Read Only)" : agent.name}
      >
        <AgentAvatar
          imageUrl={agent.imageUrl}
          name={agent.name}
          size="sm"
        />
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </button>
    );
  };

  // Filter out duplicates (if I own an agent I interacted with, show it in My Agents)
  const uniqueInteracted = interactedAgents.filter(
    (ia) => !myAgents.some((ma) => ma.tokenId === ia.tokenId)
  );

  return (
    <div className="w-20 glass-panel border-r border-emerald-500/20 overflow-y-auto flex flex-col items-center py-4 gap-4">
      {isLoading ? (
        <Loader2 className="w-6 h-6 text-emerald-300 animate-spin" />
      ) : (
        <>
          {/* My Agents Section */}
          <div className="w-full px-2 space-y-2">
            <div className="text-[10px] text-emerald-500/50 font-bold text-center uppercase tracking-wider mb-1">
              Mine
            </div>
            {myAgents.length === 0 ? (
               <div className="text-center py-2 text-xs text-green-200/30">None</div>
            ) : (
              myAgents.map((agent) => renderAgentButton(agent, true))
            )}
          </div>

          {/* Divider */}
          {uniqueInteracted.length > 0 && (
            <div className="w-12 h-px bg-emerald-500/20 my-1" />
          )}

          {/* Recent Chats Section */}
          {uniqueInteracted.length > 0 && (
            <div className="w-full px-2 space-y-2">
              <div className="text-[10px] text-emerald-500/50 font-bold text-center uppercase tracking-wider mb-1">
                Recent
              </div>
              {uniqueInteracted.map((agent) => renderAgentButton(agent, false))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

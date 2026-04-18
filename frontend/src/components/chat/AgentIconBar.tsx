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
    const isSelected = selectedAgentId === agent.tokenId;

    return (
      <button
        key={agent.tokenId}
        onClick={() => onSelectAgent(agent.tokenId)}
        className={`w-full aspect-square relative group transition-all duration-200 border ${
          isSelected
            ? "bg-signal border-signal"
            : "bg-surface-2 border-ink-08 hover:border-signal"
        }`}
        title={isLocked ? "Private Agent (Read Only)" : agent.name}
      >
        <div className="p-1">
          <AgentAvatar
            imageUrl={agent.imageUrl}
            name={agent.name}
            size="sm"
            className="rounded-none" // Force square avatars if AgentAvatar supports it via class
          />
        </div>
        
        {/* Selection Indicator (Active Border is enough, but maybe a small dot?) */}
        {isSelected && (
           <div className="absolute right-0 top-0 bottom-0 w-1 bg-background" />
        )}

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Lock className="w-4 h-4 text-ink-40" />
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
    <div className="w-20 bg-background border-r border-ink-08 overflow-y-auto flex flex-col items-center py-4 gap-4 flex-shrink-0">
      {isLoading ? (
        <Loader2 className="w-6 h-6 text-ink animate-spin mt-4" />
      ) : (
        <>
          {/* My Agents Section */}
          <div className="w-full px-2 space-y-2">
            <div className="text-[10px] text-ink-40 font-bold text-center uppercase tracking-wider mb-2">
              Mine
            </div>
            {myAgents.length === 0 ? (
               <div className="text-center py-2 text-xs text-ink-24 border border-dashed border-ink-08">Time to create!</div>
            ) : (
              myAgents.map((agent) => renderAgentButton(agent, true))
            )}
          </div>

          {/* Divider */}
          {uniqueInteracted.length > 0 && (
            <div className="w-12 h-px bg-ink-08 my-2" />
          )}

          {/* Recent Chats Section */}
          {uniqueInteracted.length > 0 && (
            <div className="w-full px-2 space-y-2">
              <div className="text-[10px] text-ink-40 font-bold text-center uppercase tracking-wider mb-2">
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

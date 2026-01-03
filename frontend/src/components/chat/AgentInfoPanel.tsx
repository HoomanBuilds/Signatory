import { Bot, Trash2, Loader2, UserCircle, Calendar } from "lucide-react";
import { AgentData } from "@/hooks/useAgentData";

interface PersonalityData {
  tone: string;
  style: string;
  role: string;
  knowledge_focus: string[];
  response_pattern: string;
  likes: string[];
  dislikes: string[];
  backstory: string;
  example_phrases: string[];
}

interface AgentInfoPanelProps {
  agent: AgentData;
  personality?: PersonalityData;
  onClearSession: () => void;
  isClearing: boolean;
}

export default function AgentInfoPanel({
  agent,
  personality,
  onClearSession,
  isClearing,
}: AgentInfoPanelProps) {
  return (
    <div className="w-80 border-r border-emerald-500/20 flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {/* Agent Image */}
        <div className="shrink-0">
          <div className="w-full aspect-square bg-linear-to-br from-emerald-500/20 to-lime-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 overflow-hidden">
            {agent.imageUrl ? (
              <img
                src={agent.imageUrl}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Bot className="w-24 h-24 text-emerald-300/50" />
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="shrink-0 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-emerald-200 mb-1">
              {agent.name}
            </h3>
            <p className="text-sm text-green-200/60">Agent #{agent.tokenId}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-3 rounded-lg border border-emerald-500/10">
              <div className="text-xs text-green-200/60 mb-1">Level</div>
              <div className="text-xl font-bold text-emerald-300">
                {agent.level}
              </div>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-emerald-500/10">
              <div className="text-xs text-green-200/60 mb-1">Chats</div>
              <div className="text-xl font-bold text-emerald-300">
                {agent.chatCount}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="shrink-0 glass-panel p-4 rounded-xl border border-emerald-500/20">
          <h4 className="text-sm font-bold text-emerald-200 mb-3">Details</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <UserCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-green-200/60 mb-0.5">Creator</div>
                <div className="text-emerald-200 font-mono text-xs truncate">
                  {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-green-200/60 mb-0.5">Created</div>
                <div className="text-emerald-200 text-xs">
                  {new Date(agent.createdAt * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality */}
        {personality ? (
          <div className="shrink-0 glass-panel p-4 rounded-xl border border-emerald-500/20">
            <h4 className="text-sm font-bold text-emerald-200 mb-3">
              Personality
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-green-200/60 mb-1">Tone</div>
                  <div className="px-2 py-1.5 bg-emerald-500/10 text-emerald-300 rounded text-xs capitalize">
                    {personality.tone}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-200/60 mb-1">Style</div>
                  <div className="px-2 py-1.5 bg-emerald-500/10 text-emerald-300 rounded text-xs capitalize">
                    {personality.style}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-200/60 mb-1">Role</div>
                  <div className="px-2 py-1.5 bg-emerald-500/10 text-emerald-300 rounded text-xs capitalize">
                    {personality.role}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-200/60 mb-1">Pattern</div>
                  <div className="px-2 py-1.5 bg-emerald-500/10 text-emerald-300 rounded text-xs capitalize">
                    {personality.response_pattern}
                  </div>
                </div>
              </div>

              {personality.knowledge_focus.length > 0 && (
                <div>
                  <div className="text-xs text-green-200/60 mb-2">
                    Knowledge Focus
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {personality.knowledge_focus.map((focus, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs capitalize"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {personality.backstory && (
                <div>
                  <div className="text-xs text-green-200/60 mb-2">
                    Backstory
                  </div>
                  <div className="text-xs text-green-200/80 bg-[#0a0f12] p-2 rounded border border-emerald-500/10">
                    {personality.backstory}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="shrink-0 glass-panel p-4 rounded-xl border border-emerald-500/20">
            <h4 className="text-sm font-bold text-emerald-200 mb-2">
              Personality Hash
            </h4>
            <div className="text-xs text-green-200/70 font-mono break-all bg-[#0a0f12] p-2 rounded border border-emerald-500/10">
              {agent.personalityHash}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Clear Session Button */}
      <div className="shrink-0 p-6 border-t border-emerald-500/20">
        <button
          onClick={onClearSession}
          disabled={isClearing}
          className="w-full px-4 py-3 glass-panel border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isClearing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Clear Session
        </button>
      </div>
    </div>
  );
}

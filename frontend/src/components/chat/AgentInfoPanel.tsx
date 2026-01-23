import { Bot, Trash2, Loader2, UserCircle, Calendar, Menu } from "lucide-react";
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
    <div className="w-80 border-r border-[#333] bg-black flex flex-col h-full">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {/* Agent Image */}
        <div className="shrink-0">
          <div className="w-full aspect-square bg-[#111] flex items-center justify-center border border-[#333] overflow-hidden">
            {agent.imageUrl ? (
              <img
                src={agent.imageUrl}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Bot className="w-24 h-24 text-[#333]" />
            )}
          </div>
        </div>

        {/* Agent Info */}
        <div className="shrink-0 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">
              {agent.name}
            </h3>
            <p className="text-xs text-[#666] font-mono">ID: #{agent.tokenId}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-0 border border-[#333] divide-x divide-[#333]">
            <div className="p-3 text-center bg-[#111]">
              <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Level</div>
              <div className="text-xl font-bold text-white font-mono">
                {agent.level}
              </div>
            </div>
            <div className="p-3 text-center bg-[#111]">
              <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Chats</div>
              <div className="text-xl font-bold text-white font-mono">
                {agent.chatCount}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="shrink-0 p-4 border border-[#333]">
          <h4 className="text-xs font-bold text-[#666] uppercase tracking-wider mb-4 border-b border-[#333] pb-2">Details</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
                <UserCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Creator</div>
                <div className="text-white font-mono text-xs truncate">
                  {agent.creator.slice(0, 6)}...{agent.creator.slice(-4)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Created</div>
                <div className="text-white text-xs font-mono">
                  {new Date(agent.createdAt * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality */}
        {personality ? (
          <div className="shrink-0 p-4 border border-[#333]">
            <h4 className="text-xs font-bold text-[#666] uppercase tracking-wider mb-4 border-b border-[#333] pb-2">
              Personality
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-[#666] mb-1 uppercase tracking-wider">Tone</div>
                  <div className="px-2 py-1.5 bg-[#111] border border-[#333] text-white text-xs capitalize">
                    {personality.tone}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#666] mb-1 uppercase tracking-wider">Style</div>
                  <div className="px-2 py-1.5 bg-[#111] border border-[#333] text-white text-xs capitalize">
                    {personality.style}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-[#666] mb-1 uppercase tracking-wider">Role</div>
                  <div className="px-2 py-1.5 bg-[#111] border border-[#333] text-white text-xs capitalize truncate">
                    {personality.role}
                  </div>
                </div>
              </div>

              {personality.knowledge_focus.length > 0 && (
                <div>
                  <div className="text-[10px] text-[#666] mb-2 uppercase tracking-wider">
                    Knowledge Focus
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {personality.knowledge_focus.map((focus, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 border border-[#333] text-white text-[10px] uppercase tracking-wide bg-[#111]"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {personality.backstory && (
                <div>
                  <div className="text-[10px] text-[#666] mb-2 uppercase tracking-wider">
                    Backstory
                  </div>
                  <div className="text-xs text-[#888] bg-[#111] p-3 border border-[#333] leading-relaxed">
                    {personality.backstory.slice(0, 150)}...
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="shrink-0 border border-[#333] p-4">
            <h4 className="text-xs font-bold text-[#666] uppercase tracking-wider mb-2">
              Personality Hash
            </h4>
            <div className="text-[10px] text-[#888] font-mono break-all bg-[#111] p-2 border border-[#333]">
              {agent.personalityHash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

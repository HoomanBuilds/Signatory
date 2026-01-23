"use client";

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

interface AgentPersonalityProps {
  personality?: PersonalityData;
  personalityHash: string;
}

export default function AgentPersonality({
  personality,
  personalityHash,
}: AgentPersonalityProps) {
  if (!personality) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-emerald-500/20">
        <h2 className="text-xl font-bold text-emerald-200 mb-4">
          Personality Hash
        </h2>
        <div className="text-sm text-green-200/70 font-mono break-all bg-[#0a0f12] p-3 rounded-lg border border-emerald-500/10">
          {personalityHash}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black p-6 border border-[#333]">
      <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Personality</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Tone</div>
            <div className="px-3 py-2 border border-[#333] text-white text-sm capitalize bg-[#111]">
              {personality.tone}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Style</div>
            <div className="px-3 py-2 border border-[#333] text-white text-sm capitalize bg-[#111]">
              {personality.style}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Role</div>
            <div className="px-3 py-2 border border-[#333] text-white text-sm capitalize bg-[#111]">
              {personality.role}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Pattern</div>
            <div className="px-3 py-2 border border-[#333] text-white text-sm capitalize bg-[#111]">
              {personality.response_pattern}
            </div>
          </div>
        </div>

        {personality.knowledge_focus.length > 0 && (
          <div>
            <div className="text-xs text-[#666] uppercase tracking-wider mb-3">
              Knowledge Focus
            </div>
            <div className="flex flex-wrap gap-2">
              {personality.knowledge_focus.map((focus, i) => (
                <span
                  key={i}
                  className="px-3 py-1 border border-[#333] text-white text-xs uppercase tracking-wide bg-[#111]"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        )}

        {personality.backstory && (
          <div>
            <div className="text-xs text-[#666] uppercase tracking-wider mb-3">Backstory</div>
            <div className="text-sm text-[#888] bg-[#111] p-4 border border-[#333] leading-relaxed">
              {personality.backstory}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

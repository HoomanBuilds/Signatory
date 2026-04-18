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
      <div className="bg-surface-2 border border-ink-08 p-6">
        <h2 className="text-xl font-bold text-signal mb-4">
          Personality Hash
        </h2>
        <div className="text-sm text-ink-40 font-mono break-all bg-surface-1 p-3 border border-ink-08">
          {personalityHash}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6 border border-ink-08">
      <h2 className="text-xl font-bold text-ink mb-6 uppercase tracking-tight">Personality</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-2">Tone</div>
            <div className="px-3 py-2 border border-ink-08 text-ink text-sm capitalize bg-surface-2">
              {personality.tone}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-2">Style</div>
            <div className="px-3 py-2 border border-ink-08 text-ink text-sm capitalize bg-surface-2">
              {personality.style}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-2">Role</div>
            <div className="px-3 py-2 border border-ink-08 text-ink text-sm capitalize bg-surface-2">
              {personality.role}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-2">Pattern</div>
            <div className="px-3 py-2 border border-ink-08 text-ink text-sm capitalize bg-surface-2">
              {personality.response_pattern}
            </div>
          </div>
        </div>

        {personality.knowledge_focus.length > 0 && (
          <div>
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-3">
              Knowledge Focus
            </div>
            <div className="flex flex-wrap gap-2">
              {personality.knowledge_focus.map((focus, i) => (
                <span
                  key={i}
                  className="px-3 py-1 border border-ink-08 text-ink text-xs uppercase tracking-wide bg-surface-2"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
        )}

        {personality.backstory && (
          <div>
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-3">Backstory</div>
            <div className="text-sm text-ink-40 bg-surface-2 p-4 border border-ink-08 leading-relaxed">
              {personality.backstory}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

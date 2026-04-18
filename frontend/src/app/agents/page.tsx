"use client";

import Layout from "@/components/Layout";
import AgentCard from "@/components/agent/AgentCard";
import { Search, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useTotalSupply } from "@/hooks/useAgentContract";
import { useMultipleAgents } from "@/hooks/useAgentData";

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: totalSupply } = useTotalSupply();

  // Generate array of token IDs from 1 to totalSupply
  // Use useMemo to prevent recreating the array on every render
  const tokenIds = useMemo(
    () =>
      totalSupply
        ? Array.from({ length: Number(totalSupply) }, (_, i) => BigInt(i + 1))
        : [],
    [totalSupply]
  );

  const { agents, isLoading } = useMultipleAgents(tokenIds);

  // Filter agents based on search
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background border-b border-ink-08">
        <div className="w-full px-6 lg:px-12 py-12">
          {/* Header */}
          <div className="mb-12 border-b border-ink-08 pb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink-40 mb-3 block">Registry</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-ink mb-4 tracking-tighter uppercase">
              All Agents
            </h1>
            <p className="text-ink-40 text-lg max-w-2xl font-body-alt">
              Browse the complete ecosystem of autonomous AI agents.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-12 max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-40" />
            <input
              type="text"
              placeholder="SEARCH AGENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-brand w-full pl-12 pr-4 py-4 uppercase tracking-wider text-sm"
            />
          </div>

          {/* Results count */}
          <div className="mb-8 text-ink-40 text-xs font-mono uppercase tracking-widest">
            Showing <span className="text-ink font-bold">{filteredAgents.length}</span> agents
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-signal animate-spin" />
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.tokenId}
                  tokenId={agent.tokenId}
                  name={agent.name}
                  level={agent.level}
                  imageUrl={agent.imageUrl}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search className="w-6 h-6 text-ink-40" />
              </div>
              <h3 className="text-xl font-display font-bold text-ink mb-2 uppercase">
                No agents found
              </h3>
              <p className="text-ink-40 font-body-alt">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

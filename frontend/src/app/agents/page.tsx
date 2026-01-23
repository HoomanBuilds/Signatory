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
      <div className="min-h-screen bg-black border-b border-[#333]">
        <div className="w-full px-6 lg:px-12 py-12">
          {/* Header */}
          <div className="mb-12 border-b border-[#333] pb-12">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tighter uppercase">
              All Agents
            </h1>
            <p className="text-[#888] text-lg max-w-2xl">
              Browse the complete ecosystem of autonomous AI agents.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-12 max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666]" />
            <input
              type="text"
              placeholder="SEARCH AGENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-black border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-white transition-colors uppercase tracking-wider text-sm"
            />
          </div>

          {/* Results count */}
          <div className="mb-8 text-[#666] text-xs uppercase tracking-widest">
            Showing <span className="text-white font-bold">{filteredAgents.length}</span> agents
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
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
            <div className="border border-dashed border-[#333] p-24 text-center">
              <div className="text-4xl mb-4 text-[#333]">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase">
                No agents found
              </h3>
              <p className="text-[#666]">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

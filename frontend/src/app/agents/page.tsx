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
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-emerald-200 mb-2">
              All Agents
            </h1>
            <p className="text-green-200/70">
              Browse all AI agents in the ecosystem
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-200/50" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass-panel rounded-xl text-emerald-200 placeholder-green-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-emerald-500/20"
            />
          </div>

          {/* Results count */}
          <div className="mb-6 text-green-200/70">
            Showing{" "}
            <span className="text-emerald-300 font-semibold">
              {filteredAgents.length}
            </span>{" "}
            agents
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
            <div className="glass-panel p-12 rounded-2xl text-center border border-emerald-500/20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-emerald-200 mb-2">
                No agents found
              </h3>
              <p className="text-green-200/70">
                Try adjusting your search query
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

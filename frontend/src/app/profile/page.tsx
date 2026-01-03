"use client";

import Layout from "@/components/Layout";
import AgentCard from "@/components/agent/AgentCard";
import { CreditsManager } from "@/components/credits/CreditsManager";
import { useAccount } from "wagmi";
import { Wallet, Copy, ExternalLink, Loader2, Coins } from "lucide-react";
import { useState } from "react";
import { useAgentNFTs } from "@/hooks/useAgentNFTs";
import { useCredits } from "@/hooks/useCredits";
import Link from "next/link";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"owned" | "created" | "credits">(
    "owned"
  );
  const [copied, setCopied] = useState(false);

  const { agents, isLoading } = useAgentNFTs(address);
  const { balance: creditsBalance } = useCredits();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="glass-panel p-12 rounded-2xl text-center max-w-md border border-emerald-500/20">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-emerald-300" />
            <h2 className="text-2xl font-bold text-emerald-200 mb-3">
              Connect Wallet
            </h2>
            <p className="text-green-200/70">
              Connect your wallet to view your profile and manage your AI agents
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="glass-panel p-8 rounded-2xl mb-10 border border-emerald-500/20 shadow-xl shadow-emerald-500/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] flex-shrink-0">
                <Wallet className="w-10 h-10 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-emerald-200 truncate">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAddress}
                      className="p-2 glass-panel rounded-lg hover:bg-[#0e1518] transition-all hover:scale-105 active:scale-95 border border-emerald-500/20"
                      title="Copy address"
                    >
                      {copied ? (
                        <span className="text-xs text-emerald-300 px-1 font-bold">
                          ✓
                        </span>
                      ) : (
                        <Copy className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 glass-panel rounded-lg hover:bg-[#0e1518] transition-all hover:scale-105 active:scale-95 border border-emerald-500/20"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-green-200/70">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                    <span className="font-semibold text-emerald-300">
                      {agents.length}
                    </span>
                    <span>Agents</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                    <span className="font-semibold text-emerald-300">
                      {agents
                        .reduce((sum, a) => sum + a.chatCount, 0)
                        .toLocaleString()}
                    </span>
                    <span>Chats</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-300">
                      {creditsBalance}
                    </span>
                    <span>Credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-emerald-900/10 p-1 rounded-xl border border-emerald-500/10 inline-flex animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            <button
              onClick={() => setActiveTab("owned")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "owned"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "text-emerald-200/60 hover:text-emerald-200 hover:bg-emerald-500/10"
                }`}
            >
              Owned ({agents.length})
            </button>
            <button
              onClick={() => setActiveTab("created")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "created"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "text-emerald-200/60 hover:text-emerald-200 hover:bg-emerald-500/10"
                }`}
            >
              Created (
              {
                agents.filter(
                  (a) => a.creator.toLowerCase() === address?.toLowerCase()
                ).length
              }
              )
            </button>
            <button
              onClick={() => setActiveTab("credits")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "credits"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "text-emerald-200/60 hover:text-emerald-200 hover:bg-emerald-500/10"
                }`}
            >
              <Coins className="w-4 h-4" />
              Credits ({creditsBalance})
            </button>
          </div>

          {/* Content */}
          {activeTab === "credits" ? (
            <CreditsManager />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
            </div>
          ) : agents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {activeTab === "owned"
                ? agents.map((agent) => (
                  <AgentCard
                    key={agent.tokenId}
                    tokenId={agent.tokenId}
                    name={agent.name}
                    level={agent.level}
                    imageUrl={agent.imageUrl}
                  />
                ))
                : agents
                  .filter(
                    (a) => a.creator.toLowerCase() === address?.toLowerCase()
                  )
                  .map((agent) => (
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
            <div className="glass-panel p-16 rounded-2xl text-center border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <div className="text-6xl">🤖</div>
              </div>
              <h3 className="text-3xl font-bold text-emerald-200 mb-3">
                No Agents Yet
              </h3>
              <p className="text-xl text-green-200/60 mb-8 max-w-md mx-auto">
                Create your first AI agent to start your journey in the metaverse!
              </p>
              <Link
                href="/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 hover:scale-105 active:scale-95"
              >
                Create Your First Agent
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

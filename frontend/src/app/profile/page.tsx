"use client";

import Layout from "@/components/Layout";
import AgentCard from "@/components/agent/AgentCard";
import { CreditsManager } from "@/components/credits/CreditsManager";
import { useAccount } from "wagmi";
import { Wallet, Copy, ExternalLink, Loader2, Coins, Bot } from "lucide-react";
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
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="empty-state max-w-md">
            <div className="empty-state-icon">
              <Wallet className="w-8 h-8 text-ink-40" />
            </div>
            <h2 className="text-2xl font-display font-bold text-ink mb-3 uppercase tracking-wide">
              Connect Wallet
            </h2>
            <p className="text-ink-40 font-body-alt">
              Connect your wallet to view your profile and manage your AI agents
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background border-b border-ink-08">
        <div className="w-full px-6 lg:px-12 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="dossier-bar mb-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-sigil flex items-center justify-center flex-shrink-0">
                <Wallet className="w-10 h-10 text-background" />
              </div>

              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-ink font-mono tracking-tight">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAddress}
                      className="p-2 border border-ink-08 hover:bg-sigil hover:text-background hover:border-sigil transition-all text-ink-40"
                      title="Copy address"
                    >
                      {copied ? (
                        <span className="text-xs font-bold">✓</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-ink-08 hover:bg-sigil hover:text-background hover:border-sigil transition-all text-ink-40"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-background border border-ink-08">
                    <span className="font-bold text-ink font-mono">{agents.length}</span>
                    <span className="text-ink-40 uppercase tracking-wider text-xs">Agents</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background border border-ink-08">
                    <span className="font-bold text-ink font-mono">
                      {agents.reduce((sum, a) => sum + a.chatCount, 0).toLocaleString()}
                    </span>
                    <span className="text-ink-40 uppercase tracking-wider text-xs">Chats</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-background border border-ink-08">
                    <Coins className="w-4 h-4 text-sigil" />
                    <span className="font-bold text-ink font-mono">{creditsBalance}</span>
                    <span className="text-ink-40 uppercase tracking-wider text-xs">Credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-bar mb-10">
              <button
                onClick={() => setActiveTab("owned")}
                className={activeTab === "owned" ? "tab-item-active" : "tab-item"}
              >
                Owned ({agents.length})
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={activeTab === "created" ? "tab-item-active" : "tab-item"}
              >
                Created ({agents.filter((a) => a.creator.toLowerCase() === address?.toLowerCase()).length})
              </button>
              <button
                onClick={() => setActiveTab("credits")}
                className={`${activeTab === "credits" ? "tab-item-active" : "tab-item"} flex items-center gap-2`}
              >
                <Coins className="w-4 h-4" />
                Credits
              </button>
            </div>

            {/* Content */}
            {activeTab === "credits" ? (
              <CreditsManager />
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-signal animate-spin" />
              </div>
            ) : agents.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Bot className="w-8 h-8 text-ink-40" />
                </div>
                <h3 className="text-2xl font-display font-bold text-ink mb-3 uppercase tracking-tight">
                  No Agents Yet
                </h3>
                <p className="text-ink-40 mb-8 max-w-sm mx-auto font-body-alt">
                  Create your first AI agent to start your journey in the metaverse!
                </p>
                <Link
                  href="/create"
                  className="btn-primary inline-flex items-center px-8 py-4 font-bold text-sm uppercase tracking-wider"
                >
                  Create Agent
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Bot, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import AgentNFTABI from "@/constants/AgentNFT.json";
import AgentMarketplaceABI from "@/constants/AgentMarketplace.json";
import contractAddresses from "@/constants/contractAddresses.json";
import AgentCard from "@/components/agent/AgentCard";

interface AgentData {
  tokenId: number;
  name: string;
  level: number;
  imageUrl?: string;
}

interface ListedAgent extends AgentData {
  price: string;
}

export default function Home() {
  const [recentAgents, setRecentAgents] = useState<AgentData[]>([]);
  const [listedAgents, setListedAgents] = useState<ListedAgent[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingListed, setIsLoadingListed] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalListings: 0,
    totalVolume: "0",
  });

  const chainId = (process.env.NEXT_PUBLIC_CHAIN_ID || "31337") as
    | "31337"
    | "11155111";

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: contractAddresses[chainId].AgentNFT as `0x${string}`,
    abi: AgentNFTABI,
    functionName: "totalSupply",
  });

  // Get marketplace stats
  const { data: marketplaceStats } = useReadContract({
    address: contractAddresses[chainId].AgentMarketplace as `0x${string}`,
    abi: AgentMarketplaceABI,
    functionName: "getMarketplaceStats",
  });

  // Fetch recent agents
  useEffect(() => {
    async function fetchRecentAgents() {
      if (!totalSupply) {
        setIsLoadingRecent(false);
        return;
      }

      const supply = Number(totalSupply);
      if (supply === 0) {
        setIsLoadingRecent(false);
        return;
      }

      // Get last 6 minted agents
      const startId = Math.max(1, supply - 5);
      const count = Math.min(6, supply);
      const tokenIds = Array.from(
        { length: count },
        (_, i) => startId + i
      );

      const agentPromises = tokenIds.map(async (tokenId) => {
        try {
          const response = await fetch("/api/agent-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokenId }),
            cache: "no-store",
          });

          if (!response.ok) return null;

          const data = await response.json();
          return {
            tokenId,
            name: data.name || `Agent #${tokenId}`,
            level: data.level || 1,
            imageUrl: data.imageUrl,
          };
        } catch (error) {
          console.error(`Error fetching agent ${tokenId}:`, error);
          return null;
        }
      });

      const agents = (await Promise.all(agentPromises))
        .filter((a) => a !== null)
        .map((a) => a as AgentData);
      setRecentAgents(agents.reverse()); // Show newest first
      setIsLoadingRecent(false);
    }

    fetchRecentAgents();
  }, [totalSupply]);

  // Fetch listed agents and update stats
  useEffect(() => {
    async function fetchListedAgents() {
      try {
        const response = await fetch("/api/marketplace-listing", {
          cache: "no-store",
        });

        if (!response.ok) {
          setIsLoadingListed(false);
          return;
        }

        const listings = await response.json();
        const listedAgentsData = listings.slice(0, 3).map((listing: any) => ({
          tokenId: listing.tokenId,
          name: listing.name,
          level: listing.level,
          price: listing.price,
          imageUrl: listing.imageUrl,
        }));

        setListedAgents(listedAgentsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoadingListed(false);
      }
    }

    fetchListedAgents();
  }, []);

  // Update stats when data is available
  useEffect(() => {
    if (totalSupply && marketplaceStats && Array.isArray(marketplaceStats)) {
      setStats({
        totalAgents: Number(totalSupply),
        totalListings: Number(marketplaceStats[0]),
        totalVolume: formatEther(marketplaceStats[2] as bigint),
      });
    }
  }, [totalSupply, marketplaceStats]);

  return (
    <Layout>
      <div className="min-h-screen relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
          {/* Hero Background with Fade */}
          <div
            className="absolute inset-0 animate-pulse-slow pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(16,185,129,0.15), transparent 50%), radial-gradient(circle at 70% 60%, rgba(132,204,22,0.1), transparent 50%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
            }}
          ></div>

          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-block mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                AI Agent NFT Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Create AI Agents
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                Own Their Power
              </span>
            </h1>

            <p className="text-xl text-green-200/80 mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Mint AI agents with unique personalities. Chat, level up, and
              trade them as NFTs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link
                href="/create"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  Create Agent
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-[#0e1518] border-2 border-emerald-500/30 text-emerald-200 font-bold rounded-xl hover:bg-[#133027] hover:border-emerald-500/50 transition-all hover:scale-105 active:scale-95"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 sm:px-6 lg:px-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass-panel p-6 rounded-xl text-center border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent mb-1">
                {stats.totalAgents}
              </div>
              <div className="text-sm text-green-200/60">Agents Created</div>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent mb-1">
                {stats.totalVolume}
              </div>
              <div className="text-sm text-green-200/60">ETH Volume</div>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent mb-1">
                {listedAgents.length}
              </div>
              <div className="text-sm text-green-200/60">Listed Now</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            {/* Recently Minted */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-200">
                    Recently Minted
                  </h2>
                </div>
                <Link
                  href="/agents"
                  className="text-emerald-300 hover:text-emerald-200 flex items-center gap-1 text-sm font-medium"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoadingRecent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
                </div>
              ) : recentAgents.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentAgents.map((agent) => (
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
                <div className="glass-panel p-8 rounded-xl text-center border border-emerald-500/20">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-emerald-300/50" />
                  <p className="text-green-200/70">No agents minted yet</p>
                </div>
              )}
            </div>

            {/* Marketplace Listings */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-200">
                    Marketplace
                  </h2>
                </div>
                <Link
                  href="/marketplace"
                  className="text-emerald-300 hover:text-emerald-200 flex items-center gap-1 text-sm font-medium"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {isLoadingListed ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
                </div>
              ) : listedAgents.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {listedAgents.map((agent) => (
                    <AgentCard
                      key={agent.tokenId}
                      tokenId={agent.tokenId}
                      name={agent.name}
                      level={agent.level}
                      imageUrl={agent.imageUrl}
                      price={agent.price}
                      isListed={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-8 rounded-xl text-center border border-emerald-500/20">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-emerald-300/50" />
                  <p className="text-green-200/70">No agents listed yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

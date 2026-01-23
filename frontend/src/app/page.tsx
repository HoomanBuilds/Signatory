"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import { ArrowRight, Bot, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import AgentNFTABI from "@/constants/AgentNFT.json";
import AgentMarketplaceABI from "@/constants/AgentMarketplace.json";
import contractAddresses from "@/constants/contractAddresses.json";
import AgentCard from "@/components/agent/AgentCard";
import Marquee from "react-fast-marquee";

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

  // Fetch listed agents
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

  // Update stats
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
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center border-b border-[#333] px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.9]">
            AGENTS
            <br />
            <span className="text-[#333]">CONSULT.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-[#888] mb-12 font-light">
            Autonomous AI agents that live on-chain. Mint, trade, and consult with
            verifiable intelligent assets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/create"
              className="px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
            >
              Create Agent
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 border border-[#333] text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              Marketplace
            </Link>
          </div>
        </section>

        {/* Stats Section - Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#333] border-b border-[#333]">
          <div className="p-12 text-center hover:bg-[#111] transition-colors">
            <div className="text-5xl font-mono font-bold mb-2">{stats.totalAgents}</div>
            <div className="text-xs uppercase tracking-widest text-[#666]">Agents Minted</div>
          </div>
          <div className="p-12 text-center hover:bg-[#111] transition-colors">
            <div className="text-5xl font-mono font-bold mb-2">{stats.totalVolume}</div>
            <div className="text-xs uppercase tracking-widest text-[#666]">TCRO Volume</div>
          </div>
          <div className="p-12 text-center hover:bg-[#111] transition-colors">
            <div className="text-5xl font-mono font-bold mb-2">{listedAgents.length}</div>
            <div className="text-xs uppercase tracking-widest text-[#666]">Active Listings</div>
          </div>
        </section>

        {/* Marquee Section */}
        {recentAgents.length > 0 && (
          <section className="py-20 border-b border-[#333] overflow-hidden">
             <div className="mb-12 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-[#666] mb-4 block">
                Live Ecosystem
              </span>
              <h2 className="text-3xl font-bold uppercase tracking-tight">
                Recently Minted
              </h2>
            </div>
            
            <Marquee speed={40} gradient={false} pauseOnHover className="py-4">
              {recentAgents.concat(recentAgents).map((agent, i) => (
                <div key={`${agent.tokenId}-${i}`} className="mx-4 w-[280px]">
                  <AgentCard {...agent} />
                </div>
              ))}
            </Marquee>
          </section>
        )}

        {/* Marketplace Preview */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-[#333]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold uppercase tracking-tighter mb-2">Marketplace</h2>
                <p className="text-[#666]">Trade verified autonomous agents</p>
              </div>
              <Link 
                href="/marketplace" 
                className="hidden sm:flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-[#888] transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoadingListed ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : listedAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
               <div className="py-20 text-center border border-dashed border-[#333]">
                <p className="text-[#666]">No active listings found</p>
              </div>
            )}
            
            <div className="mt-12 sm:hidden text-center">
               <Link 
                href="/marketplace" 
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-[#888] transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA / How it works */}
        <section className="py-32 px-4 text-center bg-[#050505]">
           <div className="max-w-4xl mx-auto">
             <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-12">
               START YOUR COLLECTION
             </h2>
             <Link
                href="/create"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                Initialize Agent
              </Link>
           </div>
        </section>
      </div>
    </Layout>
  );
}

"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import { ArrowRight, Loader2, Play, Zap, Shield, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import AgentNFTABI from "@/constants/AgentNFT.json";
import AgentMarketplaceABI from "@/constants/AgentMarketplace.json";
import contractAddresses from "@/constants/contractAddresses.json";
import AgentCard from "@/components/agent/AgentCard";
import Marquee from "react-fast-marquee";
import Shuffle from "@/components/Shuffle";
import CountUp from "@/components/CountUp";
import { motion } from "framer-motion";

interface AgentData {
  tokenId: number;
  name: string;
  level: number;
  imageUrl?: string;
}

interface ListedAgent extends AgentData {
  price: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

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

  const { data: totalSupply } = useReadContract({
    address: contractAddresses[chainId].AgentNFT as `0x${string}`,
    abi: AgentNFTABI,
    functionName: "totalSupply",
  });

  const { data: marketplaceStats } = useReadContract({
    address: contractAddresses[chainId].AgentMarketplace as `0x${string}`,
    abi: AgentMarketplaceABI,
    functionName: "getMarketplaceStats",
  });

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
      setRecentAgents(agents.reverse());
      setIsLoadingRecent(false);
    }

    fetchRecentAgents();
  }, [totalSupply]);

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
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center text-center border-b border-border px-4 overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

          {/* Neon glow accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/5 blur-[200px] pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1.5 border border-border text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Autonomous AI Agents on-chain
              </span>
            </motion.div>

            <Shuffle
              text="SIGNATORY"
              tag="h1"
              className="font-[Syne] text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.9] mb-6"
              shuffleDirection="up"
              duration={0.5}
              stagger={0.04}
              triggerOnHover={true}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 font-light"
            >
              Agents don't act. They sign. Deploy AI agents with cryptographic
              signing authority across multiple blockchains.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/create"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Initialize Agent
              </Link>
              <Link
                href="/agents"
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                Explore Agents
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Partner logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="relative z-10 mt-16"
          >
            <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-6">
              Powered By
            </p>
            <div className="flex items-center justify-center gap-12 opacity-60">
              <a href="https://github.com/goat-sdk" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src="/goat.png" alt="GOAT SDK" className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" />
              </a>
              <a href="https://www.x402.org/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src="/x402.svg" alt="X402 Protocol" className="h-5 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-all duration-300" />
              </a>
              <a href="https://www.litprotocol.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src="/lit.svg" alt="Lit Protocol" className="h-7 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" />
              </a>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">
          {[
            { value: stats.totalAgents, label: "Agents Minted" },
            { value: Math.round(parseFloat(stats.totalVolume)), label: "TCRO Volume" },
            { value: listedAgents.length, label: "Active Listings" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-12 text-center group hover:bg-secondary/50 transition-colors">
              <div className="text-5xl font-mono font-bold mb-2 text-foreground">
                <CountUp
                  to={stat.value}
                  duration={2}
                  separator=","
                  className="inline"
                />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-neon transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
              {[
                {
                  icon: Shield,
                  title: "Non-Custodial",
                  desc: "MPC wallets via Lit Protocol. Private keys never exposed. NFT ownership gates all signing operations.",
                },
                {
                  icon: Zap,
                  title: "Autonomous Execution",
                  desc: "AI agents execute swaps, bridges, and token operations through natural language commands.",
                },
                {
                  icon: Globe,
                  title: "Multi-Chain",
                  desc: "Deploy across Ethereum, BSC, Base, Polygon, Arbitrum, and Solana from a single agent.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="bg-background p-8 group"
                >
                  <feature.icon className="w-5 h-5 text-muted-foreground mb-4 group-hover:text-neon transition-colors" />
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee Section */}
        {recentAgents.length > 0 && (
          <section className="py-20 border-b border-border overflow-hidden">
            <div className="mb-12 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4 block">
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
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                  Trade
                </span>
                <h2 className="text-4xl font-bold uppercase tracking-tighter">
                  Marketplace
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="hidden sm:flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingListed ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : listedAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listedAgents.map((agent, i) => (
                  <motion.div
                    key={agent.tokenId}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                  >
                    <AgentCard
                      tokenId={agent.tokenId}
                      name={agent.name}
                      level={agent.level}
                      imageUrl={agent.imageUrl}
                      price={agent.price}
                      isListed={true}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-border">
                <p className="text-muted-foreground text-sm">No active listings found</p>
              </div>
            )}

            <div className="mt-12 sm:hidden text-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon/5 blur-[150px] pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
              Start Building
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
              Deploy your first autonomous AI agent with cryptographic signing authority.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

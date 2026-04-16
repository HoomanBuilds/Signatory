"use client";

import Layout from "@/components/Layout";
import AgentCardLarge from "@/components/agent/AgentCardLarge";
import BuyModal from "@/components/marketplace/BuyModal";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMarketplaceStats, useBuyAgent } from "@/hooks/useMarketplaceContract";
import { formatEther, parseEther } from "viem";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ListedAgent {
  tokenId: number;
  name: string;
  level: number;
  imageUrl?: string;
  price: string;
  seller: string;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listedAgents, setListedAgents] = useState<ListedAgent[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<ListedAgent | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const router = useRouter();
  const { data: stats } = useMarketplaceStats();
  const { buyAgent, isPending: isBuying, isConfirming: isBuyConfirming, isSuccess: isBuySuccess } = useBuyAgent();

  useEffect(() => {
    async function fetchListings() {
      setIsLoadingListings(true);
      try {
        const response = await fetch("/api/marketplace-listing", {
          cache: "no-store",
        });
        if (!response.ok) {
          setIsLoadingListings(false);
          return;
        }
        const listings = await response.json();
        setListedAgents(listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoadingListings(false);
      }
    }
    fetchListings();
  }, []);

  useEffect(() => {
    if (isBuySuccess && selectedAgent) {
      setIsBuyModalOpen(false);
      router.push(`/agent/${selectedAgent.tokenId}`);
    }
  }, [isBuySuccess, selectedAgent, router]);

  const handleBuyClick = (agent: ListedAgent) => {
    setSelectedAgent(agent);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuy = () => {
    if (!selectedAgent) return;
    buyAgent(selectedAgent.tokenId, parseEther(selectedAgent.price));
  };

  const filteredListings = listedAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground p-4 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
              Trade
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 uppercase tracking-tighter">
              Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl border-l-2 border-neon/30 pl-6">
              Discover and trade unique AI agents. Build your autonomous squad.
            </p>
          </motion.div>

          {/* Stats */}
          {stats && Array.isArray(stats) && stats.length === 4 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border mb-12"
            >
              {[
                { label: "Listed", value: listedAgents.length },
                { label: "Sales", value: Number(stats[1]) },
                { label: "Volume", value: `${formatEther(stats[2] as bigint)} TCRO` },
                { label: "Fee", value: `${Number(stats[3]) / 100}%` },
              ].map((stat) => (
                <div key={stat.label} className="border-r border-b border-border p-6 hover:bg-secondary/50 transition-colors">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {stat.value}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : null}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative mb-12"
          >
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH AGENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-background text-foreground placeholder-muted-foreground/30 focus:outline-none focus:ring-0 border-b border-border focus:border-neon/30 transition-all text-lg font-bold uppercase tracking-wider"
            />
          </motion.div>

          {/* Results count */}
          <div className="mb-6 text-muted-foreground text-sm uppercase tracking-wide">
            Showing <span className="text-foreground font-bold">{filteredListings.length}</span> listings
          </div>

          {/* Grid */}
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-20 border border-dashed border-border">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredListings.map((agent, i) => (
                <motion.div
                  key={agent.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <AgentCardLarge
                    tokenId={agent.tokenId}
                    name={agent.name}
                    level={agent.level}
                    imageUrl={agent.imageUrl}
                    price={agent.price}
                    href={`/agent/${agent.tokenId}`}
                    onBuyClick={() => handleBuyClick(agent)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center border border-dashed border-border">
              <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-wide">
                No listings found
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Be the first to list an agent"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {selectedAgent && (
        <BuyModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          onConfirm={handleConfirmBuy}
          agentName={selectedAgent.name}
          price={selectedAgent.price}
          isPending={isBuying}
          isConfirming={isBuyConfirming}
        />
      )}
    </Layout>
  );
}

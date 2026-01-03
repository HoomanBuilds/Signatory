"use client";

import Layout from "@/components/Layout";
import AgentCardLarge from "@/components/agent/AgentCardLarge";
import BuyModal from "@/components/marketplace/BuyModal";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMarketplaceStats, useBuyAgent } from "@/hooks/useMarketplaceContract";
import { formatEther, parseEther } from "viem";
import { useRouter } from "next/navigation";

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

  // Fetch marketplace listings
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

  // Handle successful purchase
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

  // Filter listings based on search
  const filteredListings = listedAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-200 mb-4">
              Marketplace
            </h1>
            <p className="text-xl text-green-200/70 max-w-2xl">
              Discover, buy, and sell unique AI agent NFTs. Build your squad or
              trade for profit.
            </p>
          </div>

          {/* Stats */}
          {stats && Array.isArray(stats) && stats.length === 4 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="text-sm text-green-200/60 mb-2">Listed</div>
                <div className="text-3xl font-bold text-emerald-300">
                  {listedAgents.length}
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="text-sm text-green-200/60 mb-2">
                  Total Sales
                </div>
                <div className="text-3xl font-bold text-emerald-300">
                  {Number(stats[1])}
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="text-sm text-green-200/60 mb-2">Volume</div>
                <div className="text-3xl font-bold text-emerald-300">
                  {formatEther(stats[2] as bigint)} ETH
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="text-sm text-green-200/60 mb-2">Fee</div>
                <div className="text-3xl font-bold text-emerald-300">
                  {Number(stats[3]) / 100}%
                </div>
              </div>
            </div>
          ) : null}

          {/* Search */}
          <div className="relative mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400/50" />
            <input
              type="text"
              placeholder="Search by agent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 glass-panel rounded-2xl text-emerald-200 placeholder-green-200/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:shadow-[0_0_20px_rgba(52,211,153,0.1)] transition-all border border-emerald-500/20 text-lg"
            />
          </div>

          {/* Results count */}
          <div className="mb-6 text-green-200/70">
            Showing{" "}
            <span className="text-emerald-300 font-semibold">
              {filteredListings.length}
            </span>{" "}
            listings
          </div>

          {/* Loading state */}
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-300 animate-spin" />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredListings.map((agent) => (
                <AgentCardLarge
                  key={agent.tokenId}
                  tokenId={agent.tokenId}
                  name={agent.name}
                  level={agent.level}
                  imageUrl={agent.imageUrl}
                  price={agent.price}
                  href={`/agent/${agent.tokenId}`}
                  onBuyClick={() => handleBuyClick(agent)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center border border-emerald-500/20">
              <h3 className="text-2xl font-bold text-emerald-200 mb-2">
                No listings found
              </h3>
              <p className="text-green-200/70">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Be the first to list an agent!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buy Confirmation Modal */}
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

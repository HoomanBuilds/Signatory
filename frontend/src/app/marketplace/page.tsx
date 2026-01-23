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
      <div className="min-h-screen bg-black text-white p-4 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tighter">
              Marketplace
            </h1>
            <p className="text-xl text-[#666] font-mono max-w-2xl border-l-2 border-white pl-6">
              Discover and trade unique AI agents. Build your autonomous squad.
            </p>
          </div>

          {/* Stats */}
          {stats && Array.isArray(stats) && stats.length === 4 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[#333] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              <div className="border-r border-b border-[#333] p-6 hover:bg-[#111] transition-colors">
                <div className="text-[10px] text-[#666] uppercase tracking-wider mb-2">Listed</div>
                <div className="text-3xl font-bold text-white font-mono">
                  {listedAgents.length}
                </div>
              </div>
              <div className="border-r border-b border-[#333] p-6 hover:bg-[#111] transition-colors">
                <div className="text-[10px] text-[#666] uppercase tracking-wider mb-2">
                  Sales
                </div>
                <div className="text-3xl font-bold text-white font-mono">
                  {Number(stats[1])}
                </div>
              </div>
              <div className="border-r border-b border-[#333] p-6 hover:bg-[#111] transition-colors">
                <div className="text-[10px] text-[#666] uppercase tracking-wider mb-2">Volume</div>
                <div className="text-3xl font-bold text-white font-mono">
                  {formatEther(stats[2] as bigint)} TCRO
                </div>
              </div>
              <div className="border-r border-b border-[#333] p-6 hover:bg-[#111] transition-colors">
                <div className="text-[10px] text-[#666] uppercase tracking-wider mb-2">Fee</div>
                <div className="text-3xl font-bold text-white font-mono">
                  {Number(stats[3]) / 100}%
                </div>
              </div>
            </div>
          ) : null}

          {/* Search */}
          <div className="relative mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666]" />
            <input
              type="text"
              placeholder="SEARCH AGENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-black text-white placeholder-[#333] focus:outline-none focus:ring-0 border-b border-[#333] focus:border-white transition-all text-xl font-bold uppercase tracking-wider"
            />
          </div>

          {/* Results count */}
          <div className="mb-6 text-[#666] font-mono text-sm uppercase tracking-wide">
            Showing <span className="text-white font-bold">{filteredListings.length}</span> listings
          </div>

          {/* Loading state */}
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-20 border border-[#333] border-dashed">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
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
            <div className="p-20 text-center border border-[#333] border-dashed">
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                No listings found
              </h3>
              <p className="text-[#666] font-mono">
                {searchQuery
                  ? "Try adjusting your search criteria"
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

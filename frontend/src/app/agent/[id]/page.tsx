"use client";

import Layout from "@/components/Layout";
import AgentImage from "@/components/agent/AgentImage";
import AgentDetails from "@/components/agent/AgentDetails";
import AgentPersonality from "@/components/agent/AgentPersonality";
import AgentWallet from "@/components/agent/AgentWallet";
import { useParams, useRouter } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import ListingModal from "@/components/marketplace/ListingModal";
import { useBuyAgent, useCancelListing, useMarketplaceListing } from "@/hooks/useMarketplaceContract";
import { Tag } from "lucide-react";

interface PersonalityData {
  tone: string;
  style: string;
  role: string;
  knowledge_focus: string[];
  response_pattern: string;
  likes: string[];
  dislikes: string[];
  backstory: string;
  example_phrases: string[];
}

interface AgentDetail {
  tokenId: number;
  name: string;
  description?: string;
  level: number;
  chatCount: number;
  creator: string;
  createdAt: number;
  personalityHash: string;
  personality?: PersonalityData;
  attributes?: Array<{ trait_type: string; value: string }>;
  imageUrl?: string;
  owner?: string;
  listing?: {
    active: boolean;
    price: string;
    seller: string;
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const tokenId = params.id as string;

  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const { buyAgent, isPending: isBuying, isSuccess: isBuySuccess } = useBuyAgent();
  const { cancelListing, isPending: isCancelling, isSuccess: isCancelSuccess } = useCancelListing();
  
  // Real-time listing data
  const { data: listingData, refetch: refetchListing, isLoading: isListingLoading } = useMarketplaceListing(agent?.tokenId);

  useEffect(() => {
    if (isBuySuccess || isCancelSuccess) {
        refetchListing();
    }
  }, [isBuySuccess, isCancelSuccess, refetchListing]);

  // Merge API data with real-time hook data
  const activeListing = listingData && typeof listingData === 'object' && 'active' in listingData && listingData.active === true ? {
      seller: (listingData as any).seller as string,
      price: ((listingData as any).price as bigint).toString(),
      active: (listingData as any).active as boolean
  } : (agent?.listing?.active ? agent.listing : null);

  const handleBuy = () => {
    if (!activeListing) return;
    buyAgent(agent!.tokenId, BigInt(activeListing.price));
  };

  const handleCancelListing = () => {
    if (!agent) return;
    if (!confirm("Are you sure you want to cancel this listing?")) return;
    cancelListing(agent.tokenId);
  };

  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch agent metadata
        const metadataResponse = await fetch("/api/agent-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenId: Number(tokenId) }),
          cache: "no-store",
        });

        if (!metadataResponse.ok) {
          throw new Error("Agent not found");
        }

        const metadata = await metadataResponse.json();

        // Fetch privacy settings
        try {
          const settingsResponse = await fetch(`/api/agent/settings?agentId=${tokenId}`);
          if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            setIsPublic(settings.isPublic);
          }
        } catch (e) {
          console.error("Error fetching privacy settings:", e);
        }

        // Fetch personality data from IPFS
        let personalityData = null;
        let fullMetadata = null;
        if (metadata.personalityHash) {
          try {
            const ipfsUrl = metadata.personalityHash.startsWith("ipfs://")
              ? metadata.personalityHash.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                )
              : `https://ipfs.io/ipfs/${metadata.personalityHash}`;

            const response = await fetch(ipfsUrl, { cache: "no-store" });
            if (response.ok) {
              fullMetadata = await response.json();
              personalityData = fullMetadata.personality;
            }
          } catch (e) {
            console.error("Error fetching personality data:", e);
          }
        }

        // Try to fetch listing info
        let listing = null;
        try {
          const listingResponse = await fetch("/api/marketplace-listing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokenId: Number(tokenId) }),
          });

          if (listingResponse.ok) {
            listing = await listingResponse.json();
          }
        } catch (e) {
          console.error("Error fetching listing data:", e);
        }

        setAgent({
          tokenId: Number(tokenId),
          ...metadata,
          description: fullMetadata?.description,
          personality: personalityData,
          attributes: fullMetadata?.attributes,
          listing: listing?.active ? listing : null,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load agent");
      } finally {
        setIsLoading(false);
      }
    }

    if (tokenId) {
      fetchAgentDetails();
    }
  }, [tokenId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !agent) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="border border-[#333] p-12 text-center max-w-md bg-[#050505]">
            <Bot className="w-16 h-16 mx-auto mb-6 text-[#333]" />
            <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
              Agent Not Found
            </h2>
            <p className="text-[#666] mb-6">
              {error || "This agent doesn't exist"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-all uppercase tracking-wider"
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOwner = address?.toLowerCase() === agent.owner?.toLowerCase();
  const isCreator = address?.toLowerCase() === agent.creator?.toLowerCase();

  const handleChatClick = () => {
    router.push(`/chat/${agent.tokenId}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black border-b border-[#333]">
        <div className="w-full px-6 lg:px-12 py-12">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 uppercase tracking-tight">
              {agent.name}
            </h1>
            <p className="text-[#666] font-mono">ID: #{agent.tokenId}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Image */}
            <div className="lg:col-span-2">
              <AgentImage
                imageUrl={agent.imageUrl}
                name={agent.name}
                level={agent.level}
                chatCount={agent.chatCount}
                tokenId={agent.tokenId}
              />

              {/* Chat Button */}
              {(isOwner || isPublic) && (
                <button
                  onClick={handleChatClick}
                  className="w-full py-4 mt-6 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Bot className="w-5 h-5" />
                  Chat with {agent.name}
                </button>
              )}

              {/* Marketplace Actions */}
              {activeListing?.active ? (
                <div className="bg-[#111] p-6 border border-[#333] mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-[#666] uppercase tracking-wider mb-1">
                        Current Price
                      </div>
                      <div className="text-2xl font-bold text-white font-mono">
                        {formatEther(BigInt(activeListing.price))} ETH
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">
                      Listed
                    </div>
                  </div>
                  
                  {isOwner ? (
                    <button 
                        onClick={handleCancelListing}
                        disabled={isCancelling}
                        className="w-full py-4 bg-transparent border border-red-500/50 text-red-500 font-bold uppercase tracking-wider hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                    >
                        {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cancel Listing"}
                    </button>
                  ) : (
                    <button 
                        onClick={handleBuy}
                        disabled={isBuying}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        {isBuying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buy Now"}
                    </button>
                  )}
                </div>
              ) : isOwner ? (
                <div className="mt-6">
                    <button 
                        onClick={() => setIsListingModalOpen(true)}
                        className="w-full py-4 bg-transparent border border-[#333] text-white font-bold uppercase tracking-wider hover:border-white transition-all flex items-center justify-center gap-2"
                    >
                        <Tag className="w-5 h-5" />
                        List for Sale
                    </button>
                </div>
              ) : null}
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-3 space-y-8">
              {/* Agent Wallet */}
              <AgentWallet 
                tokenId={agent.tokenId} 
                isOwner={isOwner} 
              />

              <ListingModal 
                isOpen={isListingModalOpen} 
                onClose={() => setIsListingModalOpen(false)} 
                onListingSuccess={refetchListing}
                tokenId={agent.tokenId}
                agentName={agent.name}
              />

              {/* Details */}
              <AgentDetails
                tokenId={agent.tokenId}
                creator={agent.creator}
                createdAt={agent.createdAt}
                chatCount={agent.chatCount}
                level={agent.level}
                isCreator={isCreator}
                isOwner={isOwner}
                isPublic={isPublic}
                onPublicChange={setIsPublic}
              />

              {/* Personality */}
              <AgentPersonality
                personality={agent.personality}
                personalityHash={agent.personalityHash}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

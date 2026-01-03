"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Check, Tag } from "lucide-react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useListAgent, useIsListed } from "@/hooks/useMarketplaceContract";
import { useIsApprovedForAll, useApproveForAll } from "@/hooks/useAgentContract";
import contractAddresses from "@/constants/contractAddresses.json";
import { CHAIN_ID_STRING } from "@/lib/config";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingSuccess: () => void;
  tokenId: number;
  agentName: string;
}

export default function ListingModal({ isOpen, onClose, onListingSuccess, tokenId, agentName }: ListingModalProps) {
  const [price, setPrice] = useState("");
  const { address } = useAccount();
  
  const MARKETPLACE_ADDRESS = contractAddresses[CHAIN_ID_STRING].AgentMarketplace;

  // Check if already listed
  const { data: isAlreadyListed, isLoading: isCheckingListed } = useIsListed(tokenId);

  // Approval Hook
  const { data: isApproved, isLoading: isApprovalLoading, refetch: refetchApproval } = useIsApprovedForAll(address, MARKETPLACE_ADDRESS);
  const { approveForAll, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: isApprovedSuccess } = useApproveForAll();

  // Listing Hook
  const { listAgent, isPending: isListing, isConfirming: isListingConfirming, isSuccess: isListedSuccess, error: listingError } = useListAgent();

  useEffect(() => {
    if (isApprovedSuccess) {
        refetchApproval();
    }
  }, [isApprovedSuccess, refetchApproval]);

  useEffect(() => {
    if (isListedSuccess) {
        setTimeout(() => {
            onListingSuccess();
            onClose();
        }, 2000);
    }
  }, [isListedSuccess, onClose, onListingSuccess]);

  if (!isOpen) return null;

  const handleApprove = () => {
    approveForAll(MARKETPLACE_ADDRESS, true);
  };

  const handleList = () => {
    if (!price || isNaN(Number(price))) return; 
    listAgent(tokenId, parseEther(price));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-emerald-500/20 rounded-2xl shadow-2xl shadow-emerald-500/10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            List Agent for Sale
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
            <div className="text-sm text-white/60">
                You are about to list <span className="text-emerald-300 font-semibold">{agentName}</span> on the marketplace.
            </div>

            {/* Error Display */}
            {listingError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    Transaction failed: {(listingError as any)?.message || (listingError as any)?.shortMessage || "Unknown error"}
                </div>
            )}

            {/* Already Listed Warning */}
            {Boolean(isAlreadyListed) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                    ⚠️ This agent is already listed on the marketplace. You cannot list it again.
                </div>
            )}

            {/* 1: Approve */}
            <div className={`p-4 rounded-xl border transition-all ${isApproved ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white">1. Approve Marketplace</div>
                    {isApproved ? <Check className="w-5 h-5 text-emerald-400" /> : null}
                </div>
                <div className="text-xs text-white/50 mb-3">
                    Allow the marketplace to transfer this NFT when it sells.
                </div>
                {isApprovalLoading ? (
                    <div className="flex items-center justify-center py-2 text-white/50">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Checking approval...
                    </div>
                ) : !isApproved && (
                    <button 
                        onClick={handleApprove}
                        disabled={isApproving || isApproveConfirming}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {(isApproving || isApproveConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isApproving ? "Confirm in Wallet..." : isApproveConfirming ? "Approving..." : "Approve"}
                    </button>
                )}
            </div>

            {/* 2: Set Price & List */}
            <div className={`p-4 rounded-xl border transition-all ${!isApproved ? 'opacity-50 pointer-events-none' : ''} bg-white/5 border-white/10`}>
                 <div className="font-medium text-white mb-2">2. Set Price & List</div>
                 <div className="relative mb-4">
                    <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/50 font-medium">ETH</div>
                 </div>
                 
                 <button 
                    onClick={handleList}
                    disabled={isListing || isListingConfirming || !price || Boolean(isAlreadyListed) || !isApproved}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isListing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Confirm in Wallet...
                        </>
                    ) : isListingConfirming ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Listing...
                        </>
                    ) : isListedSuccess ? (
                        <>
                            <Check className="w-5 h-5" />
                            Listed!
                        </>
                    ) : (
                        "List Agent"
                    )}
                 </button>
            </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/useCredits";
import { useAccount } from "wagmi";
import { Coins, Gift, Loader2, Sparkles } from "lucide-react";
import { formatEther } from "viem";

interface CreditPlan {
  id: number;
  credits: bigint;
  price: bigint;
  discountPercent: bigint;
  active: boolean;
}

export function CreditsManager() {
  const { address } = useAccount();
  const { balance, loading, error, refetch, contract } = useCredits();
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [canClaimFreeTier, setCanClaimFreeTier] = useState(false);
  const [creditPrice, setCreditPrice] = useState<bigint>(BigInt(0));
  const [freeTierAmount, setFreeTierAmount] = useState<bigint>(BigInt(0));
  const [loadingData, setLoadingData] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [address]);

  const loadData = async () => {
    if (!address) return;

    setLoadingData(true);
    try {
      const [plansData, hasClaimed, price, freeAmount] = await Promise.all([
        contract.getActivePlans(),
        contract.hasClaimedFreeTier(address),
        contract.getCreditPrice(),
        contract.getFreeTierAmount(),
      ]);

      setPlans(plansData);
      setCanClaimFreeTier(!hasClaimed);
      setCreditPrice(price);
      setFreeTierAmount(freeAmount);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleClaimFreeTier = async () => {
    setProcessing(true);
    const result = await contract.claimFreeTier();
    if (result.success) {
      await refetch();
      setCanClaimFreeTier(false);
    }
    // Don't show error for cancelled transactions
    setProcessing(false);
  };

  const handleBuyCredits = async (amount: number) => {
    setProcessing(true);
    const result = await contract.purchaseCredits(amount);
    if (result.success) {
      await refetch();
    }
    // Don't show error for cancelled transactions
    setProcessing(false);
  };

  const handleBuyPlan = async (planId: number) => {
    setProcessing(true);
    const result = await contract.purchasePlan(planId);
    if (result.success) {
      await refetch();
    }
    // Don't show error for cancelled transactions
    setProcessing(false);
  };

  if (!address) {
    return (
      <div className="bg-black p-8 border border-[#333] text-center">
        <Coins className="w-12 h-12 mx-auto mb-3 text-[#666]" />
        <p className="text-[#888]">
          Please connect your wallet to manage credits
        </p>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="bg-black p-8 border border-[#333] text-center">
        <Loader2 className="w-8 h-8 mx-auto text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="bg-[#111] p-8 border border-[#333]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              Your Credits
            </h2>
          </div>
          <p className="text-6xl font-bold text-white mb-2">{balance}</p>
          <p className="text-[#666] text-sm uppercase tracking-wide">1 credit = 1 chat message</p>
        </div>
      </div>

      {/* Free Tier Banner */}
      {canClaimFreeTier && (
        <div className="bg-white p-6 border-2 border-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-wide">
                Claim Your Free Credits!
              </h3>
              <p className="text-black/70 mb-4">
                Get {freeTierAmount.toString()} free credits to start chatting
                with your AI agents. One-time offer!
              </p>
              <button
                onClick={handleClaimFreeTier}
                disabled={processing}
                className="px-6 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-[#222] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  "Claim Free Credits"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Individual Credits */}
      <div className="bg-black p-6 border border-[#333]">
        <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
          Buy Credits
        </h3>
        <p className="text-sm text-[#666] mb-4">
          Price: {formatEther(creditPrice)} ETH per credit
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[10, 25, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBuyCredits(amount)}
              disabled={processing}
              className="bg-[#111] border border-[#333] text-white py-4 px-4 font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {amount} Credits
            </button>
          ))}
        </div>
      </div>

      {/* Credit Plans */}
      {plans.length > 0 && (
        <div className="bg-black p-6 border border-[#333]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              Credit Plans (Best Value)
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#111] border border-[#333] p-6 hover:border-white transition-all relative group"
              >
                {Number(plan.discountPercent) > 0 && (
                  <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1">
                    {plan.discountPercent.toString()}% OFF
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-white mb-1">
                    {plan.credits.toString()}
                  </p>
                  <p className="text-xs text-[#666] uppercase tracking-wider">Credits</p>
                </div>
                <div className="text-center mb-6">
                  <p className="text-xl font-bold text-white font-mono">
                    {formatEther(plan.price)} ETH
                  </p>
                </div>
                <button
                  onClick={() => handleBuyPlan(plan.id)}
                  disabled={processing}
                  className="w-full bg-white text-black py-3 px-4 font-bold uppercase tracking-wider hover:bg-[#ddd] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {processing ? "Processing..." : "Buy Plan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State - Only show real errors, not cancellations */}
      {(error || contract.error) &&
        !contract.error?.includes("cancelled") &&
        !contract.error?.includes("rejected") && (
          <div className="bg-red-900/10 p-4 border border-red-500/30">
            <p className="text-red-400 text-sm font-mono">{error || contract.error}</p>
          </div>
        )}
    </div>
  );
}

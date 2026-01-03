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
      <div className="glass-panel p-8 rounded-2xl text-center border border-emerald-500/20">
        <Coins className="w-12 h-12 mx-auto mb-3 text-emerald-300/50" />
        <p className="text-green-200/70">
          Please connect your wallet to manage credits
        </p>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center border border-emerald-500/20">
        <Loader2 className="w-8 h-8 mx-auto text-emerald-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-lime-500/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="w-6 h-6 text-emerald-300" />
            <h2 className="text-xl font-semibold text-emerald-200">
              Your Credits
            </h2>
          </div>
          <p className="text-6xl font-bold text-emerald-300 mb-2">{balance}</p>
          <p className="text-green-200/70 text-sm">1 credit = 1 chat message</p>
        </div>
      </div>

      {/* Free Tier Banner */}
      {canClaimFreeTier && (
        <div className="glass-panel p-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-200 mb-2">
                Claim Your Free Credits!
              </h3>
              <p className="text-green-200/70 mb-4">
                Get {freeTierAmount.toString()} free credits to start chatting
                with your AI agents. One-time offer!
              </p>
              <button
                onClick={handleClaimFreeTier}
                disabled={processing}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-black font-bold rounded-xl hover:from-emerald-400 hover:to-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
        <h3 className="text-lg font-semibold text-emerald-200 mb-2">
          Buy Credits
        </h3>
        <p className="text-sm text-green-200/60 mb-4">
          Price: {formatEther(creditPrice)} ETH per credit
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[10, 25, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBuyCredits(amount)}
              disabled={processing}
              className="glass-panel border border-emerald-500/30 text-emerald-200 py-3 px-4 rounded-xl font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {amount} Credits
            </button>
          ))}
        </div>
      </div>

      {/* Credit Plans */}
      {plans.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-semibold text-emerald-200">
              Credit Plans (Best Value!)
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="glass-panel border-2 border-emerald-500/30 rounded-xl p-5 hover:border-emerald-500/50 transition-all relative"
              >
                {Number(plan.discountPercent) > 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-lime-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    {plan.discountPercent.toString()}% OFF
                  </div>
                )}
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-emerald-300">
                    {plan.credits.toString()}
                  </p>
                  <p className="text-sm text-green-200/60">Credits</p>
                </div>
                <div className="text-center mb-4">
                  <p className="text-xl font-semibold text-emerald-200">
                    {formatEther(plan.price)} ETH
                  </p>
                </div>
                <button
                  onClick={() => handleBuyPlan(plan.id)}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-black py-3 px-4 rounded-xl font-bold hover:from-emerald-400 hover:to-lime-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <p className="text-red-400 text-sm">{error || contract.error}</p>
          </div>
        )}
    </div>
  );
}

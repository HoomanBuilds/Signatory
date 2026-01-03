"use client";

import { useState, useEffect } from "react";
import { Coins, Wallet, Loader2 } from "lucide-react";
import { useAccount, usePublicClient } from "wagmi";
import AgentCreditsABI from "@/constants/AgentCredits.json";
import contractAddresses from "@/constants/contractAddresses.json";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const CHAIN_ID_STRING = CHAIN_ID as "31337" | "11155111";
const NFT_CONTRACT_ADDRESS = contractAddresses[CHAIN_ID_STRING]?.AgentNFT;
const CREDITS_CONTRACT_ADDRESS = contractAddresses[CHAIN_ID_STRING]?.AgentCredits;

interface FloatingCreditsProps {
  agentId: number;
  isOwner: boolean;
  messageCount?: number; 
}

export default function FloatingCredits({ agentId, isOwner, messageCount = 0 }: FloatingCreditsProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [userCredits, setUserCredits] = useState<number | null>(null); 
  const [sessionCredits, setSessionCredits] = useState<number | null>(null); 
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [agentBalance, setAgentBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (!address || !publicClient) return;
      
      try {
        if (isOwner) {
          const balance = await publicClient.readContract({
            address: CREDITS_CONTRACT_ADDRESS as `0x${string}`,
            abi: AgentCreditsABI,
            functionName: "getUserCredits",
            args: [address],
          });
          setUserCredits(Number(balance));

          try {
            const response = await fetch(`/api/agent-wallet/info?tokenId=${agentId}`);
            if (response.ok) {
              const data = await response.json();
              setAgentBalance(parseFloat(data.balance));
            }
          } catch (e) {
            console.error("Error fetching agent wallet:", e);
          }
        } else {
          const balance = await publicClient.readContract({
            address: CREDITS_CONTRACT_ADDRESS as `0x${string}`,
            abi: AgentCreditsABI,
            functionName: "getSessionCredits",
            args: [address, NFT_CONTRACT_ADDRESS, BigInt(agentId)],
          });
          setSessionCredits(Number(balance));
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        if (isOwner) {
          setUserCredits(0);
        } else {
          setSessionCredits(0);
        }
      } finally {
        setIsInitialLoad(false);
      }
    }

    fetchCredits();
  }, [address, agentId, isOwner, publicClient, messageCount]);

  if (isInitialLoad) {
    return (
      <div className="absolute top-4 left-20 z-10 p-3 glass-panel border border-emerald-500/30 rounded-xl shadow-lg">
        <Loader2 className="w-5 h-5 text-emerald-300 animate-spin" />
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="absolute top-4 left-20 z-10 flex gap-2">
        <div 
          className="flex items-center gap-2 px-3 py-2 glass-panel border border-emerald-500/30 rounded-xl shadow-lg"
          title="Your Credits Balance"
        >
          <Coins className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-200">
            {userCredits ?? 0} credits
          </span>
        </div>

        {/* Show Agent Funds badge if user has no credits but agent has funds */}
        {userCredits === 0 && (agentBalance || 0) >= 0.00015 && (
          <div 
            className="flex items-center gap-2 px-3 py-2 glass-panel border border-blue-500/30 rounded-xl shadow-lg bg-blue-500/10"
            title="Agent paying from its own wallet"
          >
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">
              Agent Funds Active
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="absolute top-4 left-20 z-10 flex items-center gap-2 px-3 py-2 glass-panel border border-amber-500/30 rounded-xl shadow-lg"
      title="Session Credits for this Agent"
    >
      <Coins className="w-4 h-4 text-amber-400" />
      <span className="text-sm font-medium text-amber-200">
        {sessionCredits ?? 0} credits
      </span>
    </div>
  );
}

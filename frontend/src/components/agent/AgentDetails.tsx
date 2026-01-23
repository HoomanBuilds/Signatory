import { UserCircle, Calendar, MessageCircle, Zap, Lock, Globe, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import AgentNFTABI from "@/constants/AgentNFT.json";
import contractAddresses from "@/constants/contractAddresses.json";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const CHAIN_ID_STRING = CHAIN_ID as "31337" | "11155111";
const NFT_CONTRACT_ADDRESS = contractAddresses[CHAIN_ID_STRING]?.AgentNFT as `0x${string}`;

interface AgentDetailsProps {
  tokenId: number;
  creator: string;
  createdAt: number;
  chatCount: number;
  level: number;
  isCreator?: boolean;
  isOwner?: boolean;
  isPublic: boolean;
  onPublicChange: (isPublic: boolean) => void;
}

export default function AgentDetails({
  tokenId,
  creator,
  createdAt,
  chatCount,
  level,
  isCreator,
  isOwner,
  isPublic,
  onPublicChange,
}: AgentDetailsProps) {
  const { address } = useAccount();
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && pendingValue !== null) {
      onPublicChange(pendingValue);
      setPendingValue(null);
    }
  }, [isSuccess, pendingValue, onPublicChange]);

  const handleToggle = async () => {
    if (isPending || isConfirming) return;
    
    const newValue = !isPublic;
    setPendingValue(newValue);
    
    writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: AgentNFTABI,
      functionName: "setAgentPublic",
      args: [BigInt(tokenId), newValue],
    });
  };

  const isUpdating = isPending || isConfirming;

  return (
    <div className="bg-black p-6 mb-6 border border-[#333]">
      <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Details</h2>
      <div className="space-y-6">
        {/* Public/Private Toggle (Owner Only) */}
        {isOwner && (
          <div className="flex items-center justify-between p-4 bg-[#111] border border-[#333]">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-[#888]" />
              )}
              <div>
                <div className="text-sm font-bold text-white uppercase tracking-wide">
                  {isPublic ? "Public Chat" : "Private Chat"}
                </div>
                <div className="text-xs text-[#666] mt-1">
                  {isUpdating ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {isPending ? "Confirming..." : "Updating..."}
                    </span>
                  ) : isPublic ? "Anyone can chat" : "Only you can chat"}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none ${
                isPublic ? "bg-white" : "bg-[#333]"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`${
                  isPublic ? "translate-x-6 bg-black" : "translate-x-1 bg-[#666]"
                } inline-block h-4 w-4 transform transition-transform`}
              />
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 py-2 border-b border-[#222]">
          <div className="w-10 h-10 bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#333]">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Creator</div>
            <div className="text-white font-mono text-sm truncate">
              {creator.slice(0, 6)}...{creator.slice(-4)}
              {isCreator && (
                <span className="ml-2 px-2 py-0.5 bg-[#333] text-white text-xs uppercase">
                  You
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 border-b border-[#222]">
          <div className="w-10 h-10 bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#333]">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Created</div>
            <div className="text-white text-sm font-mono">
              {new Date(createdAt * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 border-b border-[#222]">
          <div className="w-10 h-10 bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#333]">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Total Chats</div>
            <div className="text-white text-sm font-mono">
              {chatCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 border-b border-[#222]">
          <div className="w-10 h-10 bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#333]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-1">Level</div>
            <div className="text-white text-sm font-mono">Level {level}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

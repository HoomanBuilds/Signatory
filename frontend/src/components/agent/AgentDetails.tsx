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
    <div className="glass-panel p-6 rounded-xl mb-6 border border-emerald-500/20">
      <h2 className="text-xl font-bold text-emerald-200 mb-4">Details</h2>
      <div className="space-y-4">
        {/* Public/Private Toggle (Owner Only) */}
        {isOwner && (
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-4">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <div className="text-sm font-medium text-emerald-200">
                  {isPublic ? "Public Chat" : "Private Chat"}
                </div>
                <div className="text-xs text-green-200/60">
                  {isUpdating ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {isPending ? "Confirm in wallet..." : "Updating..."}
                    </span>
                  ) : isPublic ? "Anyone can chat" : "Only you can chat"}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                isPublic ? "bg-emerald-500" : "bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`${
                  isPublic ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-green-200/60 mb-0.5">Creator</div>
            <div className="text-emerald-200 font-mono text-sm truncate">
              {creator.slice(0, 6)}...{creator.slice(-4)}
              {isCreator && (
                <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded">
                  You
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-green-200/60 mb-0.5">Created</div>
            <div className="text-emerald-200 text-sm">
              {new Date(createdAt * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-green-200/60 mb-0.5">Total Chats</div>
            <div className="text-emerald-200 text-sm">
              {chatCount.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-green-200/60 mb-0.5">Level</div>
            <div className="text-emerald-200 text-sm">Level {level}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

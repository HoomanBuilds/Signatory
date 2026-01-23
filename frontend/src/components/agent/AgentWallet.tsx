"use client";

import { useState, useEffect, useRef } from "react";
import { Wallet, Copy, ExternalLink, Loader2, RefreshCw, Shield, ChevronDown, ArrowUpRight, Check } from "lucide-react";
import { 
  NetworkEthereum,
  NetworkCronos,
  NetworkBase,
  NetworkPolygon,
  NetworkArbitrumOne,
  NetworkOptimism,
  NetworkSolana,
  NetworkCosmosHub,
  NetworkBitcoin,
} from "@web3icons/react";

interface AgentWalletProps {
  tokenId: number;
  isOwner: boolean;
}

interface PKPInfo {
  hasPKP: boolean;
  evmAddress: string | null;
  chainAddresses: Record<string, string>;
  accessControl?: string;
}

// Chain configuration - TESTNETS ONLY
const CHAIN_CONFIG: Record<string, { 
  name: string; 
  Icon: React.ComponentType<{ size?: number; variant?: "branded" | "mono" }>;
  explorer?: string;
  color: string;
}> = {
  sepolia: { 
    name: "Sepolia", 
    Icon: NetworkEthereum,
    explorer: "https://sepolia.etherscan.io/address/",
    color: "from-purple-500 to-indigo-600",
  },
  cronos: { 
    name: "Cronos Testnet", 
    Icon: NetworkCronos,
    explorer: "https://explorer.cronos.org/testnet3/address/",
    color: "from-blue-700 to-blue-900",
  },
  base_sepolia: { 
    name: "Base Sepolia", 
    Icon: NetworkBase,
    explorer: "https://sepolia.basescan.org/address/",
    color: "from-blue-500 to-blue-700",
  },
  polygon_amoy: { 
    name: "Polygon Amoy", 
    Icon: NetworkPolygon,
    explorer: "https://amoy.polygonscan.com/address/",
    color: "from-purple-500 to-purple-700",
  },
  arbitrum_sepolia: { 
    name: "Arbitrum Sepolia", 
    Icon: NetworkArbitrumOne,
    explorer: "https://sepolia.arbiscan.io/address/",
    color: "from-blue-400 to-cyan-500",
  },
  optimism_sepolia: { 
    name: "Optimism Sepolia", 
    Icon: NetworkOptimism,
    explorer: "https://sepolia-optimism.etherscan.io/address/",
    color: "from-red-500 to-rose-600",
  },
};

export default function AgentWallet({ tokenId, isOwner }: AgentWalletProps) {
  const [pkpInfo, setPkpInfo] = useState<PKPInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>("sepolia");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Array<{ symbol: string; balance: string; name: string }>>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPKPInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/agent-pkp?agentTokenId=${tokenId}`);
      if (response.ok) {
        const data = await response.json();
        setPkpInfo(data);
      }
    } catch (error) {
      console.error("Error fetching PKP info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    // All EVM testnets use the same address
    if (!pkpInfo?.evmAddress) return;
    
    setIsLoadingBalance(true);
    try {
      const response = await fetch(
        `/api/agent/balance?agentId=${tokenId}&chain=${selectedChain}`
      );
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || "0");
        setTokens(data.tokens || []);
      } else {
        setBalance(null);
        setTokens([]);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
      setTokens([]);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchPKPInfo();
  }, [tokenId]);

  useEffect(() => {
    // Fetch balance whenever chain changes or PKP info becomes available
    if (pkpInfo?.evmAddress) {
      fetchBalance();
    }
  }, [selectedChain, pkpInfo?.evmAddress]);

  const handleCopy = () => {
    const address = pkpInfo?.chainAddresses?.[selectedChain];
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-black p-6 border border-[#333] mb-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
          <span className="text-[#666] text-sm">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (!pkpInfo?.hasPKP) {
    return (
      <div className="bg-black p-6 border border-[#333] mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-[#666]" />
          <span className="text-[#666] text-sm">
            No wallet assigned to this agent
          </span>
        </div>
      </div>
    );
  }

  // All EVM testnets use the same address from the PKP
  const availableChains = Object.keys(CHAIN_CONFIG);
  const selectedConfig = CHAIN_CONFIG[selectedChain];
  const selectedAddress = pkpInfo.evmAddress; // Same address for all EVM chains
  const SelectedIcon = selectedConfig?.Icon;

  return (
    <div className="bg-black p-6 border border-[#333] mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
          <Wallet className="w-5 h-5 text-white" />
          Agent Wallet
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#111] border border-[#333]">
            <Shield className="w-3 h-3 text-white" />
            <span className="text-xs text-white uppercase tracking-wider">Lit PKP</span>
          </div>
        </div>
      </div>

      {/* Chain Selector Dropdown */}
      <div className="relative mb-6" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-4 bg-[#111] border border-[#333] hover:border-white transition-colors"
        >
          <div className="flex items-center gap-3">
            {SelectedIcon && (
              <div className="w-8 h-8 bg-white/5 border border-white/10 p-1.5 flex items-center justify-center">
                <SelectedIcon size={20} variant="branded" />
              </div>
            )}
            <span className="font-bold text-white uppercase tracking-wide">{selectedConfig?.name || selectedChain}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-[#333] shadow-xl z-50 max-h-64 overflow-y-auto">
            {availableChains.map(chain => {
              const config = CHAIN_CONFIG[chain];
              const IconComp = config?.Icon;
              const isSelected = chain === selectedChain;

              return (
                <button
                  key={chain}
                  onClick={() => {
                    setSelectedChain(chain);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-[#111] transition-colors border-b border-[#222] last:border-0 ${
                    isSelected ? "bg-[#111]" : ""
                  }`}
                >
                  {IconComp && (
                    <div className="w-7 h-7 bg-white/5 border border-white/10 p-1 flex items-center justify-center">
                      <IconComp size={18} variant="branded" />
                    </div>
                  )}
                  <span className={`flex-1 text-left uppercase text-sm font-medium ${isSelected ? "text-white" : "text-[#888]"}`}>
                    {config?.name || chain}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Chain Details */}
      {selectedAddress && (
        <div className="space-y-4">
          {/* Address */}
          <div className="p-4 bg-[#111] border border-[#333]">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Address</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-white font-mono flex-1 break-all">
                {selectedAddress}
              </code>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                  title="Copy Address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {selectedConfig?.explorer && (
                  <a
                    href={`${selectedConfig.explorer}${selectedAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="p-4 bg-[#111] border border-[#333]">
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2">Balance</div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold text-white font-mono">
                {isLoadingBalance ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>{balance ? `${parseFloat(balance).toFixed(6)}` : "—"} {selectedConfig?.name === "Cronos" ? "CRO" : "ETH"}</>
                )}
              </div>
              <button
                onClick={fetchBalance}
                className="p-2 hover:bg-[#222] text-[#888] hover:text-white transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Token Balances */}
            {!isLoadingBalance && tokens.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-[#333]">
                {tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between text-sm">
                    <span className="text-[#888]">{token.symbol}</span>
                    <span className="font-mono text-white">{parseFloat(token.balance).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions for Owner */}
          {isOwner && (
            <div className="flex gap-4">
              <a
                href={selectedConfig?.explorer ? `${selectedConfig.explorer}${selectedAddress}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-[#333] text-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </a>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-[#ddd] transition-colors"
                onClick={() => {
                  // TODO: Implement withdraw modal
                  alert("Withdraw coming soon!");
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-[#444] mt-6 text-center uppercase tracking-widest">
        Multi-chain wallet • {availableChains.length} networks supported
      </div>
    </div>
  );
}

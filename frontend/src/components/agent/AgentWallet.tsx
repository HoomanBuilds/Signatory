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
      <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 mb-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-green-200/60 text-sm">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (!pkpInfo?.hasPKP) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-green-200/40" />
          <span className="text-green-200/60 text-sm">
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
    <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-emerald-200 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Agent Wallet
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-300">Lit PKP</span>
          </div>
        </div>
      </div>

      {/* Chain Selector Dropdown */}
      <div className="relative mb-4" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-black/50 border border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            {SelectedIcon && (
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 p-1.5 flex items-center justify-center">
                <SelectedIcon size={20} variant="branded" />
              </div>
            )}
            <span className="font-medium text-emerald-100">{selectedConfig?.name || selectedChain}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-emerald-500/30 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
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
                  className={`w-full flex items-center gap-3 p-3 hover:bg-emerald-500/10 transition-colors ${
                    isSelected ? "bg-emerald-500/20" : ""
                  }`}
                >
                  {IconComp && (
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center">
                      <IconComp size={18} variant="branded" />
                    </div>
                  )}
                  <span className={`flex-1 text-left ${isSelected ? "text-emerald-300 font-medium" : "text-green-200/80"}`}>
                    {config?.name || chain}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Chain Details */}
      {selectedAddress && (
        <div className="space-y-3">
          {/* Address */}
          <div className="p-3 bg-black/40 rounded-lg border border-emerald-500/10">
            <div className="text-xs text-green-200/50 mb-1">Address</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-emerald-400/90 font-mono flex-1 break-all">
                {selectedAddress}
              </code>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-500/60 hover:text-emerald-400 transition-colors"
                  title="Copy Address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {selectedConfig?.explorer && (
                  <a
                    href={`${selectedConfig.explorer}${selectedAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-500/60 hover:text-emerald-400 transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="p-3 bg-black/40 rounded-lg border border-emerald-500/10">
            <div className="text-xs text-green-200/50 mb-1">Balance</div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold text-emerald-100">
                {isLoadingBalance ? (
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                ) : (
                  <>{balance ? `${parseFloat(balance).toFixed(6)}` : "—"} {selectedConfig?.name === "Cronos" ? "CRO" : "ETH"}</>
                )}
              </div>
              <button
                onClick={fetchBalance}
                className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-400/60 hover:text-emerald-300 transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Token Balances */}
            {!isLoadingBalance && tokens.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t border-emerald-500/10">
                {tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400/80">{token.symbol}</span>
                    <span className="font-mono text-emerald-100">{parseFloat(token.balance).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions for Owner */}
          {isOwner && (
            <div className="flex gap-2">
              <a
                href={selectedConfig?.explorer ? `${selectedConfig.explorer}${selectedAddress}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-lg text-white text-sm font-medium hover:from-emerald-500 hover:to-emerald-400 transition-colors shadow-lg shadow-emerald-500/25"
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
      <div className="text-xs text-green-200/40 mt-4 text-center">
        Multi-chain wallet • {availableChains.length} networks supported
      </div>
    </div>
  );
}

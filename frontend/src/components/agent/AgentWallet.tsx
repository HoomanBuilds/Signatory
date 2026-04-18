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
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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

  // Only show wallet to owner
  if (!isOwner) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-background p-6 border border-ink-08 mb-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-ink animate-spin" />
          <span className="text-ink-40 text-sm">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (!pkpInfo?.hasPKP) {
    return (
      <div className="bg-background p-6 border border-ink-08 mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-ink-40" />
          <span className="text-ink-40 text-sm">
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
    <div className="bg-background p-6 border border-ink-08 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2 uppercase tracking-tight">
          <Wallet className="w-5 h-5 text-ink" />
          Agent Wallet
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-ink-08">
            <Shield className="w-3 h-3 text-ink" />
            <span className="text-xs text-ink uppercase tracking-wider">Lit PKP</span>
          </div>
        </div>
      </div>

      {/* Chain Selector Dropdown */}
      <div className="relative mb-6" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-4 bg-surface-2 border border-ink-08 hover:border-signal transition-colors"
        >
          <div className="flex items-center gap-3">
            {SelectedIcon && (
              <div className="w-8 h-8 bg-surface-3 border border-ink-08 p-1.5 flex items-center justify-center">
                <SelectedIcon size={20} variant="branded" />
              </div>
            )}
            <span className="font-bold text-ink uppercase tracking-wide">{selectedConfig?.name || selectedChain}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-ink transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-ink-08 shadow-xl z-50 max-h-64 overflow-y-auto">
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
                  className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2 transition-colors border-b border-ink-08 last:border-0 ${
                    isSelected ? "bg-surface-2" : ""
                  }`}
                >
                  {IconComp && (
                    <div className="w-7 h-7 bg-surface-3 border border-ink-08 p-1 flex items-center justify-center">
                      <IconComp size={18} variant="branded" />
                    </div>
                  )}
                  <span className={`flex-1 text-left uppercase text-sm font-medium ${isSelected ? "text-ink" : "text-ink-40"}`}>
                    {config?.name || chain}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-ink" />}
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
          <div className="p-4 bg-surface-2 border border-ink-08">
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-2">Address</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-ink font-mono flex-1 break-all">
                {selectedAddress}
              </code>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-surface-3 text-ink-40 hover:text-ink transition-colors"
                  title="Copy Address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-ink" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {selectedConfig?.explorer && (
                  <a
                    href={`${selectedConfig.explorer}${selectedAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-surface-3 text-ink-40 hover:text-ink transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="p-4 bg-surface-2 border border-ink-08">
            <div className="text-xs text-ink-40 uppercase tracking-wider mb-2">Balance</div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold text-ink font-mono">
                {isLoadingBalance ? (
                  <Loader2 className="w-5 h-5 animate-spin text-ink" />
                ) : (
                  <>{balance ? `${parseFloat(balance).toFixed(6)}` : "—"} {selectedConfig?.name?.includes("Cronos") ? "TCRO" : "ETH"}</>
                )}
              </div>
              <button
                onClick={fetchBalance}
                className="p-2 hover:bg-surface-3 text-ink-40 hover:text-ink transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Token Balances */}
            {!isLoadingBalance && tokens.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-ink-08">
                {tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between text-sm">
                    <span className="text-ink-40">{token.symbol}</span>
                    <span className="font-mono text-ink">{parseFloat(token.balance).toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions for Owner */}
          <div className="flex gap-4">
            <a
              href={selectedConfig?.explorer ? `${selectedConfig.explorer}${selectedAddress}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-ink-08 text-ink-40 text-sm font-bold uppercase tracking-wider hover:border-signal hover:text-ink transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View
            </a>
            <button
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-sigil text-background text-sm font-bold uppercase tracking-wider hover:bg-sigil-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isWithdrawing || !balance || parseFloat(balance) === 0}
              onClick={async () => {
                if (!balance || parseFloat(balance) === 0) {
                  alert("No balance to withdraw");
                  return;
                }

                if (!confirm(`Withdraw all funds (${parseFloat(balance).toFixed(6)} ${selectedConfig?.name?.includes("Cronos") ? "TCRO" : "ETH"}) to your wallet?`)) {
                  return;
                }

                setIsWithdrawing(true);
                try {
                  const response = await fetch("/api/agent-wallet/withdraw", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tokenId }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || "Withdrawal failed");
                  }

                  alert(`Successfully withdrew ${data.amount} ${selectedConfig?.name?.includes("Cronos") ? "TCRO" : "ETH"}!\nTx: ${data.txHash}`);
                  fetchBalance(); // Refresh balance after withdrawal
                } catch (error: any) {
                  alert(`Withdrawal failed: ${error.message}`);
                  console.error("Withdraw error:", error);
                } finally {
                  setIsWithdrawing(false);
                }
              }}
            >
              {isWithdrawing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-ink-24 mt-6 text-center uppercase tracking-widest">
        Multi-chain wallet • {availableChains.length} networks supported
      </div>
    </div>
  );
}

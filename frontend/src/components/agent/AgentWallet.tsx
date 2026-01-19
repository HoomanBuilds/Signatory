"use client";

import { useState, useEffect } from "react";
import { Wallet, Copy, ExternalLink, Loader2, RefreshCw, Shield, ChevronDown, ChevronUp } from "lucide-react";
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

// Chain configuration with icon components
const CHAIN_CONFIG: Record<string, { 
  name: string; 
  Icon: React.ComponentType<{ size?: number; variant?: "branded" | "mono" }>;
  explorer?: string;
}> = {
  ethereum: { 
    name: "Ethereum", 
    Icon: NetworkEthereum,
    explorer: "https://etherscan.io/address/" 
  },
  cronos: { 
    name: "Cronos", 
    Icon: NetworkCronos,
    explorer: "https://cronoscan.com/address/" 
  },
  base: { 
    name: "Base", 
    Icon: NetworkBase,
    explorer: "https://basescan.org/address/" 
  },
  polygon: { 
    name: "Polygon", 
    Icon: NetworkPolygon,
    explorer: "https://polygonscan.com/address/" 
  },
  arbitrum: { 
    name: "Arbitrum", 
    Icon: NetworkArbitrumOne,
    explorer: "https://arbiscan.io/address/" 
  },
  optimism: { 
    name: "Optimism", 
    Icon: NetworkOptimism,
    explorer: "https://optimistic.etherscan.io/address/" 
  },
  solana: { 
    name: "Solana", 
    Icon: NetworkSolana,
    explorer: "https://solscan.io/account/" 
  },
  cosmos: { 
    name: "Cosmos", 
    Icon: NetworkCosmosHub,
  },
  bitcoin: { 
    name: "Bitcoin", 
    Icon: NetworkBitcoin,
  },
};

export default function AgentWallet({ tokenId, isOwner }: AgentWalletProps) {
  const [pkpInfo, setPkpInfo] = useState<PKPInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAllChains, setShowAllChains] = useState(false);

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

  useEffect(() => {
    fetchPKPInfo();
  }, [tokenId]);

  const handleCopy = (address: string, chain: string) => {
    navigator.clipboard.writeText(address);
    setCopied(chain);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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

  const chainAddresses = pkpInfo.chainAddresses || {};
  const evmChains = ["cronos", "ethereum", "base", "polygon", "arbitrum", "optimism"];
  const nonEvmChains = ["solana", "cosmos", "bitcoin"];
  
  const displayedChains = showAllChains 
    ? [...evmChains, ...nonEvmChains] 
    : ["cronos", "ethereum", "solana"];

  return (
    <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 mb-6">
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
          <button 
            onClick={fetchPKPInfo}
            className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-emerald-400/60 hover:text-emerald-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {displayedChains.map(chain => {
          const config = CHAIN_CONFIG[chain];
          const address = chainAddresses[chain];
          if (!config || !address) return null;

          const IconComponent = config.Icon;

          return (
            <div 
              key={chain}
              className="p-2.5 bg-black/40 rounded-lg border border-emerald-500/10 flex items-center justify-between group hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  <IconComponent size={24} variant="branded" />
                </div>
                <div>
                  <div className="text-xs text-green-200/50">{config.name}</div>
                  <code className="text-sm text-emerald-400/80 font-mono">
                    {truncateAddress(address)}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(address, chain)}
                  className="p-1.5 hover:bg-emerald-500/20 rounded-md text-emerald-500/60 hover:text-emerald-400 transition-colors"
                  title="Copy Address"
                >
                  {copied === chain ? (
                    <span className="text-xs text-emerald-400">✓</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {config.explorer && (
                  <a
                    href={`${config.explorer}${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-emerald-500/20 rounded-md text-emerald-500/60 hover:text-emerald-400 transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        <button
          onClick={() => setShowAllChains(!showAllChains)}
          className="w-full py-2 text-xs text-emerald-400/60 hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors"
        >
          {showAllChains ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all {Object.keys(chainAddresses).length} chains
            </>
          )}
        </button>

        <div className="text-xs text-green-200/40 mt-2">
          {isOwner ? (
            <>Multi-chain wallet powered by Lit Protocol. Sign transactions with your agent.</>
          ) : (
            <>Agent&apos;s autonomous wallet supports multiple blockchains.</>
          )}
        </div>
      </div>
    </div>
  );
}

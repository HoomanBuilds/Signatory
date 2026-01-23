/**
 * DeBridge Cross-Chain Bridge Utilities
 * 
 * Uses DeBridge Liquidity Network (DLN) for cross-chain token bridging.
 */

import { ethers } from "ethers";

// DeBridge API endpoints
const DEBRIDGE_API = "https://api.dln.trade/v1.0";

// Supported chains for bridging
export const BRIDGE_CHAINS: Record<string, {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeToken: string;
  isTestnet: boolean;
}> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
    nativeToken: "ETH",
    isTestnet: false,
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io",
    nativeToken: "ETH",
    isTestnet: true,
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    nativeToken: "ETH",
    isTestnet: false,
  },
  base_sepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    nativeToken: "ETH",
    isTestnet: true,
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    nativeToken: "MATIC",
    isTestnet: false,
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    nativeToken: "ETH",
    isTestnet: false,
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    rpcUrl: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io",
    nativeToken: "ETH",
    isTestnet: false,
  },
};

export interface BridgeQuote {
  srcChainId: number;
  dstChainId: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  srcAmount: string;
  dstAmount: string;
  estimatedFee: string;
  estimatedTime: string; // in minutes
}

export interface BridgeTx {
  to: string;
  data: string;
  value: string;
}

/**
 * Get bridge quote from DeBridge
 */
export async function getBridgeQuote(
  srcChain: string,
  dstChain: string,
  tokenAddress: string,
  amount: string,
  recipientAddress: string
): Promise<BridgeQuote | null> {
  try {
    const srcChainConfig = BRIDGE_CHAINS[srcChain.toLowerCase()];
    const dstChainConfig = BRIDGE_CHAINS[dstChain.toLowerCase()];

    if (!srcChainConfig || !dstChainConfig) {
      throw new Error(`Unsupported chain. Supported: ${Object.keys(BRIDGE_CHAINS).join(", ")}`);
    }

    const isNative = tokenAddress.toLowerCase() === "native" || tokenAddress === "0x0000000000000000000000000000000000000000";
    const srcTokenAddr = isNative 
      ? "0x0000000000000000000000000000000000000000" 
      : tokenAddress;

    const params = new URLSearchParams({
      srcChainId: srcChainConfig.chainId.toString(),
      srcChainTokenIn: srcTokenAddr,
      srcChainTokenInAmount: ethers.utils.parseEther(amount).toString(),
      dstChainId: dstChainConfig.chainId.toString(),
      dstChainTokenOut: srcTokenAddr, // Same token on destination
      dstChainTokenOutRecipient: recipientAddress,
      prependOperatingExpenses: "true",
    });

    const response = await fetch(`${DEBRIDGE_API}/order/create?${params}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error("[DeBridge] Quote error:", error);
      return null;
    }

    const data = await response.json();

    return {
      srcChainId: srcChainConfig.chainId,
      dstChainId: dstChainConfig.chainId,
      srcTokenAddress: srcTokenAddr,
      dstTokenAddress: data.estimation?.dstChainTokenOut?.address || srcTokenAddr,
      srcAmount: amount,
      dstAmount: ethers.utils.formatEther(data.estimation?.dstChainTokenOut?.amount || "0"),
      estimatedFee: ethers.utils.formatEther(data.estimation?.costs?.operatingExpenses?.amount || "0"),
      estimatedTime: data.estimation?.time?.toString() || "5",
    };
  } catch (error: any) {
    console.error("[DeBridge] Error getting quote:", error);
    return null;
  }
}

/**
 * Build bridge transaction for DeBridge
 */
export async function buildBridgeTx(
  srcChain: string,
  dstChain: string,
  tokenAddress: string,
  amount: string,
  senderAddress: string,
  recipientAddress: string
): Promise<BridgeTx | null> {
  try {
    const srcChainConfig = BRIDGE_CHAINS[srcChain.toLowerCase()];
    const dstChainConfig = BRIDGE_CHAINS[dstChain.toLowerCase()];

    if (!srcChainConfig || !dstChainConfig) {
      throw new Error(`Unsupported chain`);
    }

    const isNative = tokenAddress.toLowerCase() === "native" || tokenAddress === "0x0000000000000000000000000000000000000000";
    const srcTokenAddr = isNative 
      ? "0x0000000000000000000000000000000000000000" 
      : tokenAddress;

    const amountWei = ethers.utils.parseEther(amount);

    const params = new URLSearchParams({
      srcChainId: srcChainConfig.chainId.toString(),
      srcChainTokenIn: srcTokenAddr,
      srcChainTokenInAmount: amountWei.toString(),
      dstChainId: dstChainConfig.chainId.toString(),
      dstChainTokenOut: srcTokenAddr,
      dstChainTokenOutRecipient: recipientAddress,
      srcChainOrderAuthorityAddress: senderAddress,
      dstChainOrderAuthorityAddress: recipientAddress,
      affiliateFeePercent: "0",
      affiliateFeeRecipient: "0x0000000000000000000000000000000000000000",
      prependOperatingExpenses: "true",
    });

    const response = await fetch(`${DEBRIDGE_API}/order/create-tx?${params}`);

    if (!response.ok) {
      const error = await response.text();
      console.error("[DeBridge] Build tx error:", error);
      return null;
    }

    const data = await response.json();

    return {
      to: data.tx.to,
      data: data.tx.data,
      value: data.tx.value || amountWei.toString(),
    };
  } catch (error: any) {
    console.error("[DeBridge] Error building tx:", error);
    return null;
  }
}

/**
 * Get provider for a chain
 * Uses StaticJsonRpcProvider to skip network detection entirely
 */
export function getChainProvider(chain: string): ethers.providers.StaticJsonRpcProvider {
  const config = BRIDGE_CHAINS[chain.toLowerCase()];
  if (!config) {
    throw new Error(`Unknown chain: ${chain}`);
  }
  
  const connection: ethers.utils.ConnectionInfo = {
    url: config.rpcUrl,
    headers: { "Content-Type": "application/json" },
    skipFetchSetup: true,
  };
  
  // Use StaticJsonRpcProvider to skip network detection entirely
  return new ethers.providers.StaticJsonRpcProvider(connection, {
    name: chain.toLowerCase(),
    chainId: config.chainId,
  });
}

/**
 * Get balance on a chain
 */
export async function getChainBalance(
  chain: string,
  address: string,
  tokenAddress?: string
): Promise<string> {
  const provider = getChainProvider(chain);
  
  if (!tokenAddress || tokenAddress === "native") {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
  
  // ERC20 balance
  const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
  const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await contract.balanceOf(address);
  return ethers.utils.formatEther(balance);
}

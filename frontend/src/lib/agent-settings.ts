import { createPublicClient, http, type Chain } from "viem";
import { sepolia, hardhat } from "viem/chains";
import AgentNFTABI from "@/constants/AgentNFT.json";
import contractAddresses from "@/constants/contractAddresses.json";

const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
  ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID)
  : 31337;

const CHAIN_ID_STRING = CHAIN_ID.toString() as "31337" | "11155111" | "338";
const contractAddress = contractAddresses[CHAIN_ID_STRING]?.AgentNFT as `0x${string}`;

// Define Cronos Testnet chain for viem
const cronosTestnet: Chain = {
  id: 338,
  name: "Cronos Testnet",
  nativeCurrency: {
    name: "Cronos",
    symbol: "TCRO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evm-t3.cronos.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Cronos Explorer",
      url: "https://explorer.cronos.org/testnet",
    },
  },
  testnet: true,
};

function getChain(): Chain {
  switch (CHAIN_ID) {
    case 11155111:
      return sepolia;
    case 338:
      return cronosTestnet;
    default:
      return hardhat;
  }
}

function getPublicClient() {
  return createPublicClient({
    chain: getChain(),
    transport: http(process.env.RPC_URL),
  });
}

export interface AgentSettings {
  isPublic: boolean;
}

// Default settings
const DEFAULT_SETTINGS: AgentSettings = {
  isPublic: true,
};

/**
 * Get agent visibility from the smart contract
 * Creates a fresh client each time to avoid caching issues
 */
export async function getAgentSettings(agentId: number): Promise<AgentSettings> {
  try {
    const publicClient = getPublicClient();
    const isPublic = await publicClient.readContract({
      address: contractAddress,
      abi: AgentNFTABI,
      functionName: "agentIsPublic",
      args: [BigInt(agentId)],
    });

    console.log(`[agent-settings] Agent ${agentId} isPublic from contract: ${isPublic}`);
    return { isPublic: isPublic as boolean };
  } catch (error) {
    console.error("Error reading agent settings from contract:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Get agent visibility - sync version for compatibility
 * Note: This is a wrapper that returns default. Use getAgentSettings for actual value.
 */
export function getAgentSettingsSync(agentId: number): AgentSettings {
  return DEFAULT_SETTINGS;
}

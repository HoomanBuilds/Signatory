import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import AgentNFTABI from "@/constants/AgentNFT.json";
import contractAddresses from "@/constants/contractAddresses.json";
import { CHAIN_ID_STRING } from "@/lib/config";

const AGENT_NFT_ADDRESS = contractAddresses[CHAIN_ID_STRING]
  .AgentNFT as `0x${string}`;

// Read hooks
export function useAgentsByOwner(address: string | undefined) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS,
    abi: AgentNFTABI,
    functionName: "getAgentsByOwner",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useAgentsByCreator(address: string | undefined) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS,
    abi: AgentNFTABI,
    functionName: "getAgentsByCreator",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useAgentMetadata(tokenId: number | undefined) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS,
    abi: AgentNFTABI,
    functionName: "getAgentMetadata",
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });
}

export function useTotalSupply() {
  return useReadContract({
    address: AGENT_NFT_ADDRESS,
    abi: AgentNFTABI,
    functionName: "totalSupply",
  });
}

export function useTokenURI(tokenId: number | undefined) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS,
    abi: AgentNFTABI,
    functionName: "tokenURI",
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });
}

// Write hooks
export function useMintAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const mintAgent = async (
    name: string,
    tokenURI: string,
    personalityHash: string,
    value: bigint
  ) => {
    writeContract({
      address: AGENT_NFT_ADDRESS,
      abi: AgentNFTABI,
      functionName: "mintAgent",
      args: [name, tokenURI, personalityHash],
      value,
    });
  };

  const extractTokenId = (): number | null => {
    if (!receipt?.logs) return null;
    
    // The tokenId is in topics[3] for Transfer
    const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    
    for (const log of receipt.logs) {
      // Check for Transfer event
      if (log.topics && log.topics[0] === TRANSFER_TOPIC && log.topics.length >= 4) {
        try {
          const topic = log.topics[3]; 
          if (topic) {
            const tokenId = parseInt(topic, 16);
            console.log("[extractTokenId] Found Transfer event, tokenId:", tokenId);
            if (!isNaN(tokenId)) return tokenId;
          }
        } catch {
          continue;
        }
      }
      // Also check for any event with tokenId in topics[1] (AgentMinted)
      if (log.topics && log.topics.length >= 2) {
        try {
          const topic = log.topics[1];
          if (topic) {
            const tokenId = parseInt(topic, 16);
            if (!isNaN(tokenId) && tokenId > 0 && tokenId < 1000000) {
              console.log("[extractTokenId] Found potential tokenId in topics[1]:", tokenId);
              return tokenId;
            }
          }
        } catch {
          continue;
        }
      }
    }
    return null;
  };

  // Register PKP after successful mint
  const registerPKP = async (tokenId: number, userAddress: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/agent-pkp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentTokenId: tokenId,
          userAddress,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("[PKP] Registered:", result.data.evmAddress);
        return result.data.evmAddress;
      }
    } catch (error) {
      console.error("[PKP] Error registering PKP:", error);
    }
    return null;
  };

  return {
    mintAgent,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    receipt,
    extractTokenId,
    registerPKP,
  };
}

export function useIsApprovedForAll(owner: string | undefined, operator: string | undefined) {
  return useReadContract({
    address: AGENT_NFT_ADDRESS,
    abi: AgentNFTABI,
    functionName: "isApprovedForAll",
    args: owner && operator ? [owner, operator] : undefined,
    query: {
      enabled: !!owner && !!operator,
    },
  });
}

export function useApproveForAll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveForAll = async (operator: string, approved: boolean) => {
    writeContract({
      address: AGENT_NFT_ADDRESS,
      abi: AgentNFTABI,
      functionName: "setApprovalForAll",
      args: [operator, approved],
    });
  };

  return {
    approveForAll,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

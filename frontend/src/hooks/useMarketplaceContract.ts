import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import AgentMarketplaceABI from "@/constants/AgentMarketplace.json";
import contractAddresses from "@/constants/contractAddresses.json";
import { CHAIN_ID_STRING } from "@/lib/config";

const MARKETPLACE_ADDRESS = contractAddresses[CHAIN_ID_STRING]
  .AgentMarketplace as `0x${string}`;
const AGENT_NFT_ADDRESS = contractAddresses[CHAIN_ID_STRING]
  .AgentNFT as `0x${string}`;

// Read hooks
export function useMarketplaceListing(tokenId: number | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: AgentMarketplaceABI,
    functionName: "getListing",
    args:
      tokenId !== undefined ? [AGENT_NFT_ADDRESS, BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });
}

export function useIsListed(tokenId: number | undefined) {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: AgentMarketplaceABI,
    functionName: "isListed",
    args:
      tokenId !== undefined ? [AGENT_NFT_ADDRESS, BigInt(tokenId)] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });
}

export function useMarketplaceStats() {
  return useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: AgentMarketplaceABI,
    functionName: "getMarketplaceStats",
  });
}

// Write hooks
export function useListAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listAgent = async (tokenId: number, price: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: AgentMarketplaceABI,
      functionName: "listAgent",
      args: [AGENT_NFT_ADDRESS, BigInt(tokenId), price],
    });
  };

  return {
    listAgent,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useBuyAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buyAgent = async (tokenId: number, price: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: AgentMarketplaceABI,
      functionName: "buyAgent",
      args: [AGENT_NFT_ADDRESS, BigInt(tokenId)],
      value: price,
    });
  };

  return {
    buyAgent,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useCancelListing() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelListing = async (tokenId: number) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: AgentMarketplaceABI,
      functionName: "cancelListing",
      args: [AGENT_NFT_ADDRESS, BigInt(tokenId)],
    });
  };

  return {
    cancelListing,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

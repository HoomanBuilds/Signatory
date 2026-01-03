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
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
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

  return {
    mintAgent,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
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

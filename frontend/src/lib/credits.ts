import { ethers } from "ethers";
import AgentCreditsAbi from "@/constants/AgentCredits.json";
import { getContractAddresses } from "./web3";

/**
 * Get AgentCredits contract instance (server-side only)
 */
export function getCreditsContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
  chainId: number
) {
  const addresses = getContractAddresses(chainId);
  return new ethers.Contract(
    addresses.AgentCredits,
    AgentCreditsAbi,
    signerOrProvider
  );
}

/**
 * Get backend wallet for authorized spending
 */
export function getBackendWallet(): ethers.Wallet {
  const privateKey = process.env.BACKEND_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("BACKEND_PRIVATE_KEY not configured");
  }

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error("RPC_URL not configured");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Check if user has sufficient credits
 */
export async function checkUserCredits(
  userAddress: string,
  requiredCredits: number = 1
): Promise<{ hasCredits: boolean; balance: bigint }> {
  const wallet = getBackendWallet();
  if (!wallet.provider) {
    throw new Error("Wallet provider not available");
  }
  const chainId = 11155111;
  const contract = getCreditsContract(wallet, Number(chainId));

  const balance = await contract.getUserCredits(userAddress);

  return {
    hasCredits: balance >= BigInt(requiredCredits),
    balance,
  };
}

/**
 * Spend user credits (backend only - requires authorized spender)
 */
export async function spendUserCredits(
  userAddress: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const wallet = getBackendWallet();
    if (!wallet.provider) {
      throw new Error("Wallet provider not available");
    }
    const chainId = (await wallet.provider.getNetwork()).chainId;
    const contract = getCreditsContract(wallet, Number(chainId));

    // Check balance first
    const { hasCredits, balance } = await checkUserCredits(userAddress, amount);
    if (!hasCredits) {
      return {
        success: false,
        error: `Insufficient credits. Balance: ${balance}, Required: ${amount}`,
      };
    }

    // Spend credits
    const tx = await contract.spendCredits(userAddress, amount, reason);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("Error spending credits:", error);
    return {
      success: false,
      error: error.message || "Failed to spend credits",
    };
  }
}

/**
 * Get user credit balance (read-only)
 */
export async function getUserCreditBalance(
  userAddress: string
): Promise<bigint> {
  const wallet = getBackendWallet();
  if (!wallet.provider) {
    throw new Error("Wallet provider not available");
  }
  const chainId = 11155111;
  const contract = getCreditsContract(wallet, Number(chainId));

  return await contract.getUserCredits(userAddress);
}

/**
 * Check if user has session credits for an agent (on-chain)
 * @param nftContract The NFT contract address
 */
export async function checkSessionCredits(
  userAddress: string,
  nftContract: string,
  agentId: number
): Promise<{ hasCredits: boolean; balance: bigint }> {
  const wallet = getBackendWallet();
  if (!wallet.provider) {
    throw new Error("Wallet provider not available");
  }
  const chainId = 11155111;
  const contract = getCreditsContract(wallet, Number(chainId));

  // New signature: getSessionCredits(address user, address nftContract, uint256 agentId)
  const balance = await contract.getSessionCredits(userAddress, nftContract, agentId);

  return {
    hasCredits: balance > BigInt(0),
    balance,
  };
}

/**
 * Use a session credit (backend only - requires authorized spender)
 * @param nftContract The NFT contract address
 */
export async function useSessionCredit(
  userAddress: string,
  nftContract: string,
  agentId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const wallet = getBackendWallet();
    if (!wallet.provider) {
      throw new Error("Wallet provider not available");
    }
    const chainId = 11155111; 
    const contract = getCreditsContract(wallet, Number(chainId));

    // Check balance first
    const { hasCredits } = await checkSessionCredits(userAddress, nftContract, agentId);
    if (!hasCredits) {
      return {
        success: false,
        error: "Insufficient session credits",
      };
    }

    // Use credit - new signature includes nftContract
    const tx = await contract.useSessionCredit(userAddress, nftContract, agentId);
    
    console.log(`Session credit used for ${userAddress} (Agent ${agentId}): ${tx.hash}`);

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error: any) {
    console.error("Error using session credit:", error);
    return {
      success: false,
      error: error.message || "Failed to use session credit",
    };
  }
}

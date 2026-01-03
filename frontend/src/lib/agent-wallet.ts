import { ethers } from "ethers";
import contractAddresses from "@/constants/contractAddresses.json";

// Get NFT contract address
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const CHAIN_ID_STRING = CHAIN_ID as "31337" | "11155111";
const NFT_CONTRACT_ADDRESS = contractAddresses[CHAIN_ID_STRING]?.AgentNFT;

/**
 * Derives a deterministic wallet for an agent based on the NFT contract address and agent ID.
 * Uses keccak256(abi.encodePacked(nftContract, agentId)) to generate a unique private key.
 * 
 * Including the contract address prevents wallet collisions if the NFT contract is redeployed.
 */
export function getAgentWallet(tokenId: number): ethers.Wallet {
  const masterPrivateKey = process.env.BACKEND_PRIVATE_KEY;
  if (!masterPrivateKey) {
    throw new Error("BACKEND_PRIVATE_KEY not configured");
  }

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error("RPC_URL not configured");
  }

  if (!NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT contract address not configured");
  }

  // Deterministically generate private key for the agent
  // Using nftContract + tokenId ensures unique wallets even if contract is redeployed
  const agentPrivateKey = ethers.solidityPackedKeccak256(
    ["address", "uint256"],
    [NFT_CONTRACT_ADDRESS, tokenId]
  );

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(agentPrivateKey, provider);
}

/**
 * Get the public address of an agent's wallet
 */
export function getAgentWalletAddress(tokenId: number): string {
  const wallet = getAgentWallet(tokenId);
  return wallet.address;
}

/**
 * Check agent wallet balance
 */
export async function getAgentBalance(tokenId: number): Promise<string> {
  const wallet = getAgentWallet(tokenId);
  if (!wallet.provider) return "0";
  
  const balance = await wallet.provider.getBalance(wallet.address);
  return ethers.formatEther(balance);
}

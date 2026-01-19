import { ethers } from "ethers";
import AgentNFTAbi from "@/constants/AgentNFT.json";
import { getContractAddresses } from "./web3";
import { getBackendWallet } from "./credits";

/**
 * Get AgentNFT contract instance (server-side only)
 */
export function getAgentNFTContract(
    signerOrProvider: ethers.Signer | ethers.providers.Provider,
    chainId: number
) {
    const addresses = getContractAddresses(chainId);
    return new ethers.Contract(
        addresses.AgentNFT,
        AgentNFTAbi,
        signerOrProvider
    );
}

/**
 * Record a chat interaction for an agent
 * This function is called by the backend when a user chats with an agent.
 * It increments the chat count and handles leveling up.
 */
export async function recordAgentChat(
    tokenId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        const wallet = getBackendWallet();
        if (!wallet.provider) {
            throw new Error("Wallet provider not available");
        }
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const contract = getAgentNFTContract(wallet, Number(chainId));
        const tx = await contract.recordChat(tokenId);
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error: any) {
        console.error(`Error recording chat for agent ${tokenId}:`, error);
        return {
            success: false,
            error: error.message || "Failed to record chat",
        };
    }
}
/**
 * Get the owner of an agent
 */
export async function getAgentOwner(tokenId: number): Promise<string> {
    const wallet = getBackendWallet();
    if (!wallet.provider) {
        throw new Error("Wallet provider not available");
    }
    const chainId = (await wallet.provider.getNetwork()).chainId;
    const contract = getAgentNFTContract(wallet, Number(chainId));
    return await contract.ownerOf(tokenId);
}

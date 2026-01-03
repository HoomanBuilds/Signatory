import { NextRequest, NextResponse } from "next/server";
import { getAgentWalletAddress, getAgentBalance } from "@/lib/agent-wallet";
import { ethers } from "ethers";
import RevenueShareABI from "@/constants/RevenueShare.json";
import contractAddresses from "@/constants/contractAddresses.json";
import { getBackendWallet } from "@/lib/credits";
import { getAuthenticatedAddress } from "@/lib/auth";

const CHAIN_ID = "11155111"; // Sepolia
const REVENUE_SHARE_ADDRESS = (contractAddresses as any)[CHAIN_ID]?.RevenueShare;

export async function GET(req: NextRequest) {
  try {
    // Verify SIWE Authentication
    const authenticatedAddress = await getAuthenticatedAddress();
    
    if (!authenticatedAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your wallet." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("tokenId");

    if (!tokenId) {
      return NextResponse.json(
        { error: "Missing tokenId" },
        { status: 400 }
      );
    }

    const address = getAgentWalletAddress(Number(tokenId));
    const balance = await getAgentBalance(Number(tokenId));

    // Check registration status
    let isRegistered = false;
    try {
        const wallet = getBackendWallet();
        if (wallet && REVENUE_SHARE_ADDRESS) {
            const contract = new ethers.Contract(
                REVENUE_SHARE_ADDRESS,
                RevenueShareABI,
                wallet
            );
            const registeredWallet = await contract.agentWallets(tokenId);
            isRegistered = registeredWallet.toLowerCase() === address.toLowerCase();
        }
    } catch (e) {
        console.error("Error checking registration:", e);
    }

    return NextResponse.json({
      address,
      balance,
      isRegistered
    });

  } catch (error: any) {
    console.error("Wallet info error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet info" },
      { status: 500 }
    );
  }
}

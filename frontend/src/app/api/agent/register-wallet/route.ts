import { NextRequest, NextResponse } from "next/server";
import { getBackendWallet } from "@/lib/credits";
import { ethers } from "ethers";
import RevenueShareABI from "@/constants/RevenueShare.json";
import contractAddresses from "@/constants/contractAddresses.json";
import { getAuthenticatedAddress } from "@/lib/auth";

const CHAIN_ID = "11155111"; // Sepolia
const REVENUE_SHARE_ADDRESS = (contractAddresses as any)[CHAIN_ID]?.RevenueShare;

export async function POST(req: NextRequest) {
  try {
    // Verify SIWE Authentication
    const authenticatedAddress = await getAuthenticatedAddress();
    
    if (!authenticatedAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your wallet." },
        { status: 401 }
      );
    }

    const { agentId, walletAddress } = await req.json();

    if (!agentId || !walletAddress) {
      return NextResponse.json(
        { error: "Missing agentId or walletAddress" },
        { status: 400 }
      );
    }

    const wallet = getBackendWallet();
    if (!wallet) {
      return NextResponse.json(
        { error: "Backend wallet not configured" },
        { status: 500 }
      );
    }

    const contract = new ethers.Contract(
      REVENUE_SHARE_ADDRESS,
      RevenueShareABI,
      wallet
    );

    console.log(`Registering wallet ${walletAddress} for agent ${agentId}...`);

    const tx = await contract.setAgentWallet(agentId, walletAddress);
    await tx.wait();

    console.log(`Wallet registered: ${tx.hash}`);

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error: any) {
    console.error("Error registering agent wallet:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

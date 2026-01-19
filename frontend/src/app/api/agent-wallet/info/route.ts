/**
 * API Route: Get Agent Wallet Info
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { getCronosTestnetProvider } from "@/lib/ethers-provider";
import AgentPKPAbi from "@/constants/AgentPKP.json";
import contractAddresses from "@/constants/contractAddresses.json";

const CRONOS_TESTNET_CHAIN_ID = "338";

type ChainAddresses = {
  AgentNFT: string;
  AgentMarketplace: string;
  AgentCredits: string;
  RevenueShare: string;
  AgentPKP?: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get("tokenId");

    if (!tokenId) {
      return NextResponse.json(
        { error: "Missing tokenId" },
        { status: 400 }
      );
    }

    const addresses = (contractAddresses as Record<string, ChainAddresses>)[CRONOS_TESTNET_CHAIN_ID];
    if (!addresses?.AgentPKP) {
      return NextResponse.json(
        { error: "AgentPKP contract not deployed" },
        { status: 500 }
      );
    }

    const provider = getCronosTestnetProvider();
    const agentPKPContract = new ethers.Contract(
      addresses.AgentPKP,
      AgentPKPAbi,
      provider
    );

    const hasPKP = await agentPKPContract.hasPKP(tokenId);
    
    if (!hasPKP) {
      return NextResponse.json({
        hasPKP: false,
        address: null,
        balance: "0",
      });
    }

    const evmAddress = await agentPKPContract.getAgentWallet(tokenId);
    
    // Get balance on Cronos
    const balance = await provider.getBalance(evmAddress);

    return NextResponse.json({
      hasPKP: true,
      address: evmAddress,
      balance: ethers.utils.formatEther(balance),
      accessControl: "lit-actions",
    });

  } catch (error: any) {
    console.error("Wallet info error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet info" },
      { status: 500 }
    );
  }
}

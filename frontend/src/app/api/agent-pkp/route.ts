/**
 * API Route: Register PKP for Agent
 * 
 * Called after an agent is minted to create a PKP wallet.
 * Backend sponsors Lit Protocol gas costs and retains PKP ownership.
 * Access is controlled via Lit Actions that check AgentNFT ownership.
 */

import { NextRequest, NextResponse } from "next/server";
import { mintPKPForAgent, checkLitBalance } from "@/lib/lit-protocol";
import { ethers } from "ethers";

import AgentPKPAbi from "@/constants/AgentPKP.json";
import contractAddresses from "@/constants/contractAddresses.json";

const CRONOS_TESTNET_CHAIN_ID = "338";
const CRONOS_TESTNET_RPC = "https://evm-t3.cronos.org";

type ChainAddresses = {
  AgentNFT: string;
  AgentMarketplace: string;
  AgentCredits: string;
  RevenueShare: string;
  AgentPKP?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentTokenId, userAddress } = body;

    if (!agentTokenId || !userAddress) {
      return NextResponse.json(
        { error: "Missing agentTokenId or userAddress" },
        { status: 400 }
      );
    }

    const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY;
    if (!backendPrivateKey) {
      console.error("[PKP] BACKEND_PRIVATE_KEY not configured");
      return NextResponse.json(
        { error: "Backend not configured for PKP minting" },
        { status: 500 }
      );
    }

    const { balance, hasBalance } = await checkLitBalance(backendPrivateKey);
    if (!hasBalance) {
      console.error(`[PKP] Insufficient Lit balance: ${balance}`);
      return NextResponse.json(
        { error: "Backend has insufficient Lit tokens" },
        { status: 500 }
      );
    }

    console.log(`[PKP] Minting PKP for agent ${agentTokenId}`);

    const { pkpTokenId, pkpPublicKey, evmAddress } = await mintPKPForAgent(
      backendPrivateKey
    );

    console.log(`[PKP] PKP minted: ${evmAddress}`);

    // Register PKP in AgentPKP contract on Cronos
    const cronosProvider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const cronosWallet = new ethers.Wallet(backendPrivateKey, cronosProvider);

    const addresses = (contractAddresses as Record<string, ChainAddresses>)[CRONOS_TESTNET_CHAIN_ID];
    if (!addresses?.AgentPKP) {
      return NextResponse.json(
        { error: "AgentPKP contract not deployed on this network" },
        { status: 500 }
      );
    }

    const agentPKPContract = new ethers.Contract(
      addresses.AgentPKP,
      AgentPKPAbi,
      cronosWallet
    );

    const pkpPublicKeyBytes = pkpPublicKey.startsWith("0x")
      ? pkpPublicKey
      : "0x" + pkpPublicKey;

    const pkpTokenIdBytes32 = ethers.zeroPadValue(
      ethers.toBeHex(BigInt(pkpTokenId)),
      32
    );

    console.log(`[PKP] Registering PKP in AgentPKP contract...`);
    const tx = await agentPKPContract.registerPKP(
      agentTokenId,
      pkpPublicKeyBytes,
      evmAddress,
      pkpTokenIdBytes32
    );

    const receipt = await tx.wait();
    console.log(`[PKP] Registration tx: ${receipt.hash}`);

    return NextResponse.json({
      success: true,
      data: {
        agentTokenId,
        pkpTokenId,
        pkpPublicKey,
        evmAddress,
        transactionHash: receipt.hash,
        accessControl: "lit-actions",
      },
    });
  } catch (error: any) {
    console.error("[PKP] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register PKP" },
      { status: 500 }
    );
  }
}

/**
 * GET: Check PKP status for an agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentTokenId = searchParams.get("agentTokenId");

    if (!agentTokenId) {
      return NextResponse.json(
        { error: "Missing agentTokenId" },
        { status: 400 }
      );
    }

    const cronosProvider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const addresses = (contractAddresses as Record<string, ChainAddresses>)[CRONOS_TESTNET_CHAIN_ID];
    
    if (!addresses?.AgentPKP) {
      return NextResponse.json(
        { error: "AgentPKP contract not deployed" },
        { status: 500 }
      );
    }

    const agentPKPContract = new ethers.Contract(
      addresses.AgentPKP,
      AgentPKPAbi,
      cronosProvider
    );

    const hasPKP = await agentPKPContract.hasPKP(agentTokenId);
    
    if (!hasPKP) {
      return NextResponse.json({
        hasPKP: false,
        evmAddress: null,
      });
    }

    const evmAddress = await agentPKPContract.getAgentWallet(agentTokenId);
    const pkpInfo = await agentPKPContract.getPKPInfo(agentTokenId);

    return NextResponse.json({
      hasPKP: true,
      evmAddress,
      pkpPublicKey: pkpInfo._pkpPublicKey,
      pkpTokenId: pkpInfo._pkpTokenId,
      agentOwner: pkpInfo.agentOwner,
      accessControl: "lit-actions",
    });
  } catch (error: any) {
    console.error("[PKP] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get PKP info" },
      { status: 500 }
    );
  }
}

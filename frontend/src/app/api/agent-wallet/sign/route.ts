/**
 * API Route: Sign Transaction for Agent Wallet
 * 
 * Signs a transaction using the agent's PKP wallet.
 * Verifies caller owns the AgentNFT via Lit Actions before signing.
 */

import { NextRequest, NextResponse } from "next/server";
import { executeAgentSign, signAgentTransaction } from "@/lib/lit-protocol";
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

/**
 * POST: Sign a message or transaction for an agent
 * 
 * Body:
 * - agentTokenId: The AgentNFT token ID
 * - callerAddress: Address of the user requesting signature (must own AgentNFT)
 * - message?: Raw message to sign (for signMessage)
 * - transaction?: Transaction object to sign (for sendTransaction)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentTokenId, callerAddress, message, transaction } = body;

    // Validate input
    if (!agentTokenId || !callerAddress) {
      return NextResponse.json(
        { error: "Missing agentTokenId or callerAddress" },
        { status: 400 }
      );
    }

    if (!message && !transaction) {
      return NextResponse.json(
        { error: "Must provide either message or transaction to sign" },
        { status: 400 }
      );
    }

    const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY;
    if (!backendPrivateKey) {
      return NextResponse.json(
        { error: "Backend not configured" },
        { status: 500 }
      );
    }

    const addresses = (contractAddresses as Record<string, ChainAddresses>)[CRONOS_TESTNET_CHAIN_ID];
    if (!addresses?.AgentPKP || !addresses?.AgentNFT) {
      return NextResponse.json(
        { error: "Contracts not deployed" },
        { status: 500 }
      );
    }

    const cronosProvider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
    const agentPKPContract = new ethers.Contract(
      addresses.AgentPKP,
      AgentPKPAbi,
      cronosProvider
    );

    const hasPKP = await agentPKPContract.hasPKP(agentTokenId);
    if (!hasPKP) {
      return NextResponse.json(
        { error: "Agent does not have a PKP wallet" },
        { status: 400 }
      );
    }

    const pkpInfo = await agentPKPContract.getPKPInfo(agentTokenId);
    const pkpPublicKey = pkpInfo._pkpPublicKey;

    console.log(`[Sign] Agent ${agentTokenId} signing request from ${callerAddress}`);

    if (message) {
      const messageHash = ethers.hashMessage(message);
      const toSign = ethers.getBytes(messageHash);

      const { signature, recid } = await executeAgentSign(
        backendPrivateKey,
        agentTokenId,
        addresses.AgentNFT,
        callerAddress,
        pkpPublicKey,
        toSign,
        "cronos"
      );

      const fullSignature = "0x" + signature + (recid + 27).toString(16).padStart(2, "0");

      return NextResponse.json({
        success: true,
        signature: fullSignature,
        type: "message",
      });
    }

    if (transaction) {
      const signedTx = await signAgentTransaction(
        backendPrivateKey,
        agentTokenId,
        addresses.AgentNFT,
        callerAddress,
        pkpPublicKey,
        transaction,
        "cronos"
      );

      return NextResponse.json({
        success: true,
        signedTransaction: signedTx,
        type: "transaction",
      });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Sign] Error:", error);
    
    if (error.message?.includes("does not own")) {
      return NextResponse.json(
        { error: "Caller does not own this agent" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to sign" },
      { status: 500 }
    );
  }
}

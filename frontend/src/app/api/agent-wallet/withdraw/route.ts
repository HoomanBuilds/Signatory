/**
 * API Route: Withdraw from Agent Wallet
 */

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { signAgentTransaction } from "@/lib/lit-protocol";
import { getCronosTestnetProvider } from "@/lib/ethers-provider";
import AgentPKPAbi from "@/constants/AgentPKP.json";
import AgentNFTAbi from "@/constants/AgentNFT.json";
import contractAddresses from "@/constants/contractAddresses.json";
import { getAuthenticatedAddress } from "@/lib/auth";

const CRONOS_TESTNET_CHAIN_ID = "338";

type ChainAddresses = {
  AgentNFT: string;
  AgentMarketplace: string;
  AgentCredits: string;
  RevenueShare: string;
  AgentPKP?: string;
};

export async function POST(req: NextRequest) {
  try {
    const authenticatedAddress = await getAuthenticatedAddress();
    
    if (!authenticatedAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your wallet." },
        { status: 401 }
      );
    }

    const { tokenId } = await req.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: "Missing tokenId" },
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

    const provider = getCronosTestnetProvider();

    // Verify caller is the owner
    const agentNFTContract = new ethers.Contract(
      addresses.AgentNFT,
      AgentNFTAbi,
      provider
    );
    const owner = await agentNFTContract.ownerOf(tokenId);

    if (authenticatedAddress.toLowerCase() !== owner.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the agent owner can withdraw funds" },
        { status: 403 }
      );
    }

    // Get PKP info
    const agentPKPContract = new ethers.Contract(
      addresses.AgentPKP,
      AgentPKPAbi,
      provider
    );

    const hasPKP = await agentPKPContract.hasPKP(tokenId);
    if (!hasPKP) {
      return NextResponse.json(
        { error: "Agent does not have a PKP wallet" },
        { status: 400 }
      );
    }

    const pkpInfo = await agentPKPContract.getPKPInfo(tokenId);
    const pkpAddress = pkpInfo._evmAddress;
    const pkpPublicKey = pkpInfo._pkpPublicKey;

    // Check balance
    const balance = await provider.getBalance(pkpAddress);
    if (balance.isZero()) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    // Calculate gas
    const gasLimit = ethers.BigNumber.from(21000);
    const gasPrice = await provider.getGasPrice();
    const gasCost = gasLimit.mul(gasPrice);

    if (balance.lte(gasCost)) {
      return NextResponse.json(
        { error: "Balance too low to cover gas" },
        { status: 400 }
      );
    }

    const amountToSend = balance.sub(gasCost);
    const nonce = await provider.getTransactionCount(pkpAddress);

    console.log(`[Withdraw] Withdrawing ${ethers.utils.formatEther(amountToSend)} CRO from Agent ${tokenId} to ${owner}`);

    // Sign transaction using Lit Actions
    const signedTx = await signAgentTransaction(
      backendPrivateKey,
      Number(tokenId),
      addresses.AgentNFT,
      authenticatedAddress,
      pkpPublicKey,
      {
        to: owner,
        value: amountToSend.toString(),
        data: "0x",
        chainId: 338,
        nonce,
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
      },
      "cronos"
    );

    // Broadcast transaction
    const txResponse = await provider.sendTransaction(signedTx);
    await txResponse.wait();

    return NextResponse.json({
      success: true,
      txHash: txResponse.hash,
      amount: ethers.utils.formatEther(amountToSend),
      recipient: owner,
    });

  } catch (error: any) {
    console.error("[Withdraw] Error:", error);
    
    if (error.message?.includes("does not own")) {
      return NextResponse.json(
        { error: "Caller does not own this agent" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Withdrawal failed" },
      { status: 500 }
    );
  }
}

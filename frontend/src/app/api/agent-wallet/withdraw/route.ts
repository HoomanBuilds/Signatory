import { NextRequest, NextResponse } from "next/server";
import { getAgentWallet } from "@/lib/agent-wallet";
import { getAgentOwner } from "@/lib/agent-contract";
import { ethers } from "ethers";
import { getAuthenticatedAddress } from "@/lib/auth";

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

    const { tokenId } = await req.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: "Missing tokenId" },
        { status: 400 }
      );
    }

    // 1. Verify Owner
    // We strictly withdraw ONLY to the current owner to prevent theft.
    const ownerAddress = await getAgentOwner(Number(tokenId));
    
    if (!ownerAddress) {
        return NextResponse.json(
            { error: "Could not determine agent owner" },
            { status: 404 }
        );
    }

    // Verify authenticated user is the owner
    if (authenticatedAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the agent owner can withdraw funds." },
        { status: 403 }
      );
    }

    // 2. Get Agent Wallet
    const agentWallet = getAgentWallet(Number(tokenId));
    const balance = await agentWallet.provider?.getBalance(agentWallet.address);

    if (!balance || balance === BigInt(0)) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    // 3. Calculate Gas and Amount
    // Simple transfer gas limit is usually 21000
    const gasLimit = BigInt(21000);
    const feeData = await agentWallet.provider?.getFeeData();
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("10", "gwei"); // Fallback
    const gasCost = gasLimit * gasPrice;

    if (balance <= gasCost) {
        return NextResponse.json(
            { error: "Balance too low to cover gas" },
            { status: 400 }
        );
    }

    const amountToSend = balance - gasCost;

    console.log(`Withdrawing ${ethers.formatEther(amountToSend)} ETH from Agent ${tokenId} to Owner ${ownerAddress}`);

    // 4. Send Transaction
    const tx = await agentWallet.sendTransaction({
      to: ownerAddress,
      value: amountToSend,
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });

    await tx.wait();

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      amount: ethers.formatEther(amountToSend),
      recipient: ownerAddress
    });

  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: error.message || "Withdrawal failed" },
      { status: 500 }
    );
  }
}

/**
 * Agent Swap API
 * 
 * POST /api/agent/swap
 * Executes a token swap on Uniswap V3 Sepolia using agent's PKP wallet.
 * Supports native ETH swaps (no approval needed) and token swaps.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAddress } from "@/lib/auth";
import { executeAgentSwap } from "@/lib/agent-actions";

interface SwapRequest {
  agentId: number;
  fromToken: string; // Token symbol: ETH, WETH, USDC, DAI
  toToken: string;
  amount: string; 
  slippage?: number; 
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authenticatedAddress = await getAuthenticatedAddress();
    if (!authenticatedAddress) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: SwapRequest = await req.json();
    const { agentId, fromToken, toToken, amount, slippage = 0.5 } = body;

    if (!agentId || !fromToken || !toToken || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: agentId, fromToken, toToken, amount" },
        { status: 400 }
      );
    }

    const result = await executeAgentSwap({
      agentId,
      fromToken,
      toToken,
      amount,
      slippage,
      userAddress: authenticatedAddress,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Agent Swap] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute swap" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getRecentMessages } from "@/lib/vectordb";
import { getAuthenticatedAddress } from "@/lib/auth";

/**
 * GET /api/chat/history?agentId=1&userAddress=0x...&limit=50
 * Fetch chat history for an agent
 */
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
    const agentId = searchParams.get("agentId");
    const userAddress = searchParams.get("userAddress");
    const sessionId = searchParams.get("sessionId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!agentId || !userAddress) {
      return NextResponse.json(
        { error: "Missing agentId or userAddress" },
        { status: 400 }
      );
    }

    // Verify user can only access their own history
    if (authenticatedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "You can only access your own chat history." },
        { status: 403 }
      );
    }

    const messages = await getRecentMessages(
      parseInt(agentId),
      userAddress,
      limit,
      sessionId
    );

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

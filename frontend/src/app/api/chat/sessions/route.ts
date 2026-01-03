import { NextRequest, NextResponse } from "next/server";
import { getChatSessions } from "@/lib/vectordb";
import { getAuthenticatedAddress } from "@/lib/auth";

/**
 * GET /api/chat/sessions?agentId=1&userAddress=0x...
 * Get all chat sessions for an agent
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

    if (!agentId || !userAddress) {
      return NextResponse.json(
        { error: "Missing agentId or userAddress" },
        { status: 400 }
      );
    }

    // Verify user can only access their own sessions
    if (authenticatedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "You can only access your own chat sessions." },
        { status: 403 }
      );
    }

    const sessions = await getChatSessions(parseInt(agentId), userAddress);

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

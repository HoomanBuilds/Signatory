import { NextRequest, NextResponse } from "next/server";
import { deleteAgentMemories } from "@/lib/vectordb";
import { getAuthenticatedAddress } from "@/lib/auth";

/**
 * DELETE /api/memory/clear
 * Clear all memories for an agent/user
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify SIWE Authentication
    const authenticatedAddress = await getAuthenticatedAddress();
    
    if (!authenticatedAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your wallet." },
        { status: 401 }
      );
    }

    const { agentId, userAddress, sessionId } = await req.json();

    if (!agentId || !userAddress) {
      return NextResponse.json(
        { error: "agentId and userAddress required" },
        { status: 400 }
      );
    }

    // Verify user can only clear their own memories
    if (authenticatedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "You can only clear your own memories." },
        { status: 403 }
      );
    }

    const result = await deleteAgentMemories(agentId, userAddress, sessionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to clear memories" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Memories cleared successfully",
    });
  } catch (error: any) {
    console.error("Clear memory error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear memories" },
      { status: 500 }
    );
  }
}

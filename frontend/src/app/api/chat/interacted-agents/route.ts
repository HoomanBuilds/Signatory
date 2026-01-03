import { NextRequest, NextResponse } from "next/server";
import { getInteractedAgentIds } from "@/lib/vectordb";
import { getAgentSettings } from "@/lib/agent-settings";
import { getAuthenticatedAddress } from "@/lib/auth";

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
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address required" },
        { status: 400 }
      );
    }

    // Verify user can only access their own interaction history
    if (authenticatedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "You can only access your own interaction history." },
        { status: 403 }
      );
    }

    const agentIds = await getInteractedAgentIds(userAddress);

    // Attach privacy settings to each agent (async)
    const agents = await Promise.all(
      agentIds.map(async (id) => {
        const settings = await getAgentSettings(id);
        return {
          agentId: id,
          isPublic: settings.isPublic,
        };
      })
    );

    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error("Error fetching interacted agents:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

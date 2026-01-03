import { NextRequest, NextResponse } from "next/server";
import { getAgentSettings } from "@/lib/agent-settings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
  }

  try {
    const settings = await getAgentSettings(parseInt(agentId));
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Error fetching agent settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

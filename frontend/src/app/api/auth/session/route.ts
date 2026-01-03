import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface SessionData {
  address: string;
  chainId: number;
  issuedAt: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("siwe_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    try {
      // Decode the base64 session data
      const sessionData: SessionData = JSON.parse(
        Buffer.from(sessionCookie, "base64").toString("utf-8")
      );

      return NextResponse.json({
        authenticated: true,
        address: sessionData.address,
        chainId: sessionData.chainId,
      });
    } catch {
      // Invalid session data, clear it
      cookieStore.delete("siwe_session");
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}

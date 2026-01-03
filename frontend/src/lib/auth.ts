import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface SessionData {
  address: string;
  chainId: number;
  issuedAt: string;
}

/**
 * Get the authenticated wallet address from the session cookie.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedAddress(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("siwe_session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie, "base64").toString("utf-8")
    );

    return sessionData.address;
  } catch {
    return null;
  }
}

/**
 * Get full session data from the session cookie.
 * Returns null if not authenticated.
 */
export async function getSessionData(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("siwe_session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie, "base64").toString("utf-8")
    );

    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Require authentication for an API route.
 * Returns the authenticated address if valid, or a 401 response if not.
 */
export async function requireAuth(
  _req: NextRequest
): Promise<{ address: string } | NextResponse> {
  const address = await getAuthenticatedAddress();

  if (!address) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in with your wallet." },
      { status: 401 }
    );
  }

  return { address };
}

/**
 * Type guard to check if requireAuth returned an error response
 */
export function isAuthError(
  result: { address: string } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}

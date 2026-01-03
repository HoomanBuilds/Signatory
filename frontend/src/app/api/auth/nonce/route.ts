import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  try {
    // Generate a cryptographically secure random nonce
    const nonce = crypto.randomBytes(16).toString("hex");

    // Store nonce in a temporary cookie (5 min expiry)
    // This will be verified when the user signs the message
    const cookieStore = await cookies();
    cookieStore.set("siwe_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}

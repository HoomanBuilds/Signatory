import { NextRequest, NextResponse } from "next/server";
import { streamAgentResponse } from "@/lib/openai";
import { spendUserCredits, checkUserCredits } from "@/lib/credits";
import {
  storeMessage,
  searchMemories,
  getRecentMessages,
} from "@/lib/vectordb";
import axios from "axios";
import { recordAgentChat } from "@/lib/agent-contract";
import { sepolia } from "viem/chains";
import { getAuthenticatedAddress } from "@/lib/auth";
import contractAddresses from "@/constants/contractAddresses.json";

// Get NFT contract address for session credits
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const CHAIN_ID_STRING = CHAIN_ID as "31337" | "11155111";
const NFT_CONTRACT_ADDRESS = contractAddresses[CHAIN_ID_STRING]?.AgentNFT;

// Configuration
const CREDIT_AMOUNT = 1;
const CREDIT_PRICE_ETH = "0.0001";

/**
 * Fetch agent personality from IPFS
 */
async function fetchAgentPersonality(tokenURI: string) {
  try {
    let httpUrl: string;

    const gateway = (
      process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud"
    )
      .replace("https://", "")
      .replace("http://", "");

    if (tokenURI.startsWith("ipfs://")) {
      httpUrl = tokenURI.replace("ipfs://", `https://${gateway}/ipfs/`);
    } else if (
      tokenURI.startsWith("http://") ||
      tokenURI.startsWith("https://")
    ) {
      httpUrl = tokenURI;
    } else {
      httpUrl = `https://${gateway}/ipfs/${tokenURI}`;
    }

    console.log("Fetching personality from:", httpUrl);
    const response = await axios.get(httpUrl);
    return response.data.personality || response.data;
  } catch (error) {
    console.error("Error fetching personality:", error);
    throw new Error("Failed to fetch agent personality");
  }
}

/**
 * Core chat logic
 */
async function coreChatLogic(req: NextRequest, isPaid: boolean) {
  try {
    const {
      userAddress,
      agentId,
      tokenURI,
      message,
      useMemory = true,
      sessionId,
      personality: providedPersonality,
    } = await req.json();

    const [personality, chatHistory, kbContext] = await Promise.all([
      providedPersonality ? Promise.resolve(providedPersonality) : fetchAgentPersonality(tokenURI),
      (async () => {
        if (!useMemory) return [];

        try {
          const [recentMessages, relevantMemories] = await Promise.all([
            getRecentMessages(agentId, userAddress, 10, sessionId),
            searchMemories(agentId, userAddress, message, 3, sessionId),
          ]);

          const allMessages = [...recentMessages, ...relevantMemories];
          const uniqueMessages = Array.from(
            new Map(allMessages.map((m) => [m.timestamp, m])).values()
          ).sort((a, b) => a.timestamp - b.timestamp);

          return uniqueMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
        } catch (error) {
          console.error("Error fetching memories:", error);
          return [];
        }
      })(),
      (async () => {
        try {
          const metadata = providedPersonality || await fetchAgentPersonality(tokenURI);
          if (metadata.knowledgeBaseId) {
            const { searchKnowledgeBase } = require("@/lib/vectordb");
            const docs = await searchKnowledgeBase(
              metadata.knowledgeBaseId,
              message,
              2
            );
            return docs.join("\n\n");
          }
        } catch (error) {
          console.error("Error fetching knowledge base context:", error);
        }
        return "";
      })(),
    ]);

    let finalMessage = message;
    if (kbContext) {
      finalMessage = `[Context from Knowledge Base]
${kbContext}
[End Context]

User Message:
${message}`;
    }

    const result = await streamAgentResponse(
      personality,
      finalMessage,
      chatHistory
    );

    let fullResponse = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullResponse += text;
        controller.enqueue(chunk);
      },
      flush() {
        (async () => {
          if (!isPaid) {
            try {
              await spendUserCredits(userAddress, 1, `chat_agent_${agentId}`);
            } catch (err) {
              console.error("Background credit spending failed:", err);
            }
          }

          try {
            await recordAgentChat(agentId);
          } catch (err) {
            console.error("Background chat recording failed:", err);
          }

          if (useMemory) {
            try {
              const timestamp = Date.now();
              await Promise.all([
                storeMessage(
                  agentId,
                  userAddress,
                  "user",
                  message,
                  timestamp,
                  sessionId
                ),
                storeMessage(
                  agentId,
                  userAddress,
                  "assistant",
                  fullResponse,
                  timestamp + 1,
                  sessionId
                ),
              ]);
            } catch (error) {
              console.error("Background vector DB storage failed:", error);
            }
          }
        })();
      },
    });

    return new Response(result.body?.pipeThrough(transformStream), {
      headers: result.headers,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat
 */
export async function POST(req: NextRequest) {
  try {
    const clone = req.clone();
    const { userAddress, agentId } = await clone.json();

    if (!userAddress || !agentId) {
       return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Verify SIWE Authentication
    const authenticatedAddress = await getAuthenticatedAddress();
    
    if (!authenticatedAddress) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your wallet." },
        { status: 401 }
      );
    }

    // Verify the authenticated address matches the request
    if (authenticatedAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Address mismatch. Please sign in with the correct wallet." },
        { status: 403 }
      );
    }

    // 2. Check Permissions & Payment
    const { getAgentSettings } = require("@/lib/agent-settings");
    const { getAgentOwner } = require("@/lib/agent-contract");
    const { 
      verifyCreditPurchase, AGENT_CREDITS_ADDRESS, AGENT_CREDITS_ABI_EXPORT 
    } = require("@/lib/payment");
    const { 
      checkUserCredits, 
      spendUserCredits, 
      checkSessionCredits, 
      useSessionCredit 
    } = require("@/lib/credits");
    
    const settings = await getAgentSettings(agentId);
    const owner = await getAgentOwner(agentId);
    const isOwner = owner && owner.toLowerCase() === userAddress.toLowerCase();

    console.log(`[PRIVACY CHECK] Agent ${agentId}: isPublic=${settings.isPublic}, owner=${owner}, userAddress=${userAddress}, isOwner=${isOwner}`);

    // If Private and NOT Owner -> Forbidden
    if (!settings.isPublic && !isOwner) {
      console.log(`[PRIVACY CHECK] BLOCKED - Agent ${agentId} is private and user is not owner`);
      return NextResponse.json(
        { error: "This agent is private. Only the owner can chat with it." },
        { status: 403 }
      );
    }

    // OWNER FLOW: AgentCredits / Agent Wallet
    if (isOwner) {
      // 1. Check AgentCredits Balance
      const { hasCredits } = await checkUserCredits(userAddress, 1);
      if (hasCredits) {
        return coreChatLogic(req, false); 
      }

      // 2. Check for Credit Purchase Transaction
      const txHash = req.headers.get("X-Transaction-Hash");
      if (txHash) {
        const isValid = await verifyCreditPurchase(txHash, CREDIT_AMOUNT, userAddress);
        if (isValid) {
          return coreChatLogic(req, true);
        }
      }

      // 3. Agent Auto-Pay disabled - now using PKP wallets
      // TODO: Implement PKP-based auto-pay using /api/agent-wallet/sign

      // 4. Return 402 for AgentCredits
      return NextResponse.json(
        {
          error: "Insufficient credits. Payment required.",
          paymentRequired: {
            type: "smart-contract-call",
            chainId: sepolia.id,
            contractAddress: AGENT_CREDITS_ADDRESS,
            abi: AGENT_CREDITS_ABI_EXPORT,
            functionName: "purchaseCredits",
            args: [CREDIT_AMOUNT],
            value: CREDIT_PRICE_ETH,
            currency: "ETH",
            description: "Buy 1 Credit to Chat"
          }
        },
        { status: 402 }
      );
    }

    // PUBLIC USER FLOW: On-Chain Session Credits

    // 1. Check On-Chain Session Credits
    const { hasCredits: hasSessionCredits } = await checkSessionCredits(userAddress, NFT_CONTRACT_ADDRESS, agentId);
    
    if (hasSessionCredits) {
      // Use 1 credit (Backend Transaction)
      // Note: This costs gas for the platform!
      try {
        const result = await useSessionCredit(userAddress, NFT_CONTRACT_ADDRESS, agentId);
        if (!result.success) {
           console.error("Failed to use session credit:", result.error);
           return NextResponse.json({ error: "Failed to process session credit" }, { status: 500 });
        }
        console.log("Session credit tx broadcast:", result.txHash);
        return coreChatLogic(req, true);
      } catch (error) {
        console.error("Failed to use session credit:", error);
        return NextResponse.json({ error: "Failed to process session credit" }, { status: 500 });
      }
    }

    // 2. Check for New Session Purchase (Transaction Hash)
    const txHash = req.headers.get("X-Transaction-Hash");
    if (txHash) {
       
       return NextResponse.json(
          { error: "Payment not yet confirmed or invalid. Please wait a moment." },
          { status: 402 }
        );
    }

    // 3. Return 402 for Session Purchase
    return NextResponse.json(
      {
        error: "Session expired. Payment required.",
        paymentRequired: {
          type: "smart-contract-call",
          chainId: sepolia.id,
          contractAddress: AGENT_CREDITS_ADDRESS,
          abi: AGENT_CREDITS_ABI_EXPORT,
          functionName: "purchaseSession",
          args: [NFT_CONTRACT_ADDRESS, agentId],
          value: "0.005",
          currency: "ETH",
          description: "Pay 0.005 ETH for 50 messages"
        }
      },
      { status: 402 }
    );

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
